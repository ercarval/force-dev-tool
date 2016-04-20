"use strict";

var Command = require('./command');
var config = new (require('../config'))();
var CliUtils = require('../cli/utils');
var fdt = require('../');
var MetadataUtils = require('force-metadata-utils');
var MetadataContainer = MetadataUtils.MetadataContainer;
var MetadataComponent = MetadataUtils.MetadataComponent;
var Manifest = MetadataUtils.Manifest;
var path = require('path');
var _ = require("underscore");

var doc = "Usage:\n" +
"	force-dev-tool advanced-diff <source> <target> [options]\n" +
"\n" +
"Options:\n" +
"	--package=<package>    Path to package.xml [default: src/package.xml].";

var SubCommand = module.exports = function(project) {
	var self = this;
	Command.call(self, doc, project);
};

SubCommand.prototype = Object.create(Command.prototype);
SubCommand.prototype.constructor = SubCommand;

SubCommand.prototype.complete = function(tabtab, data) {
	// TODO: allow glob completion
	return tabtab.log(['-f', '--force'], data, '');
};

SubCommand.prototype.process = function(callback) {
	var self = this;
	self.opts = self.docopt();
	self.source = self.opts['<source>'];
	self.target = self.opts['<target>'];
	self.packagePath = path.resolve(self.opts['--package']);
	self.currentPackageXml = Manifest.fromPackageXml(CliUtils.readFileSafe(self.packagePath));
	var apiVersion = self.opts['--apiVersion'] || self.currentPackageXml.apiVersion || config.get('defaultApiVersion');
	var input = "";
	process.stdin.setEncoding('utf8');
	process.stdin.on('readable', function() {
		var read = process.stdin.read();
		if (read === null) {
			process.stdin.end();
		}
		else {
			console.error('readable not null');
		}
	});
	process.stdin.on('data', function(data) {
		input += data;
	});
	process.stdin.on('close', function() {
		var metadataContainer = new MetadataContainer();
		// 1. get metadataContainer with changes based on unified diff
		try {
			var result = new fdt.Diff(input).getMetadataContainers();
			metadataContainer = result.source.diff(result.target);
		}
		catch (e) {
			if (e.message !== "Unexpected end of input") {
				console.error(e);
			}
			else {
				throw e;
			}
		}
		metadataContainer.manifest.apiVersion = apiVersion;

		var ignorePatterns = CliUtils.readForceIgnore(self.project.storage.forceIgnorePath);
		// 1. source
		var manifestSource = self.project.getManifest(self.opts['<source>']);
		var unpackagedManifestSourceJSON = _.filter(manifestSource.manifest(), function(item) {
			return item.manageableState !== 'installed' && item.type !== 'InstalledPackage';
		});
		manifestSource = new Manifest({manifestJSON: unpackagedManifestSourceJSON});
		manifestSource = new Manifest({manifestJSON: manifestSource.getNotIgnoredMatches(ignorePatterns)});

		// 2. target
		var manifestTarget = self.project.getManifest(self.opts['<target>']);
		var unpackagedManifestTargetJSON = _.filter(manifestTarget.manifest(), function(item) {
			return item.manageableState !== 'installed' && item.type !== 'InstalledPackage';
		});
		manifestTarget = new Manifest({manifestJSON: unpackagedManifestTargetJSON});
		manifestTarget = new Manifest({manifestJSON: manifestTarget.getNotIgnoredMatches(ignorePatterns)});

		var entries = [];
		_.union(metadataContainer.manifest.manifest(), metadataContainer.destructiveManifest.manifest()).forEach(function(component){
			var s = _.findWhere(manifestSource.manifestJSON, {type: component.type, fullName: component.fullName});
			var t = _.findWhere(manifestTarget.manifestJSON, {type: component.type, fullName: component.fullName});
			entries.push({
				component: new MetadataComponent(component).toString(),
				source: {
					lastModifiedDate: s ? s.lastModifiedDate : '',
					lastModifiedByName: s ? s.lastModifiedByName : ''
				},
				target: {
					lastModifiedDate: t ? t.lastModifiedDate : '',
					lastModifiedByName: t ? t.lastModifiedByName : ''
				}
			});
		});

		// format output as csv
		entries = _.sortBy(entries, 'component');
		var lines = [];
		// header
		lines.push([
			'component',
			'onlyIn',
			'latestVersionIn',
			'lastModifiedByName',
			'lastModifiedDate',
			'direction',
			'comment',
			self.source + '_last_modified_user',
			self.target + '_last_modified_user',
			self.source + '_last_modified_date',
			self.target + '_last_modified_date'
		].join(","));
		var remoteNames = {
			'source': self.source,
			'target': self.target
		};
		entries.forEach(function(item){
			var latest = '';
			var onlyInOrg = '';
			if (item.source.lastModifiedDate && item.target.lastModifiedDate) {
				if (item.source.lastModifiedDate < item.target.lastModifiedDate) {
					latest = 'target';
				}
				else if (item.source.lastModifiedDate > item.target.lastModifiedDate) {
					latest = 'source';
				}
			}
			else if (item.target.lastModifiedDate) {
				onlyInOrg = 'target';
				latest = 'target';
			}
			else if (item.source.lastModifiedDate) {
				onlyInOrg = 'source';
				latest = 'source';
			}
			lines.push([
				item.component,
				remoteNames[onlyInOrg] ? remoteNames[onlyInOrg] : '',
				remoteNames[latest] ? remoteNames[latest] : '',
				latest !== '' ? item[latest].lastModifiedByName : '',
				latest !== '' ? item[latest].lastModifiedDate : '',
				'',
				'',
				item.source.lastModifiedByName,
				item.target.lastModifiedByName,
				item.source.lastModifiedDate,
				item.target.lastModifiedDate
			].join(","));
		});
		// output to stdout
		console.log(lines.join("\n"));
		callback(null);
	});
	process.stdin.on('end', function() {
		// console.error('end');
	});
	process.stdin.resume();
};
