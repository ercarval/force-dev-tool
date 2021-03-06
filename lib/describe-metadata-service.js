"use strict";

var _ = require('underscore');
var path = require('path');

// TODO: this should be parsed from Metadata WSDL
var childTypes = [{
	xmlName: 'ActionOverride',
	tagName: 'actionOverrides',
	parent: 'CustomObject',
	key: 'actionName'
}, {
	xmlName: 'AssignmentRule',
	tagName: 'assignmentRule',
	parent: 'AssignmentRules',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'AutoResponseRule',
	tagName: 'autoResponseRule',
	parent: 'AutoResponseRules',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'CustomField',
	tagName: 'fields',
	parent: 'CustomObject',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'BusinessProcess',
	tagName: 'businessProcesses',
	parent: 'CustomObject',
	key: 'fullName'
}, {
	xmlName: 'CompactLayout',
	tagName: 'compactLayouts',
	parent: 'CustomObject',
	key: 'fullName'
}, {
	xmlName: 'RecordType',
	tagName: 'recordTypes',
	parent: 'CustomObject',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WebLink',
	tagName: 'webLinks',
	parent: 'CustomObject',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'ValidationRule',
	tagName: 'validationRules',
	parent: 'CustomObject',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'SharingReason',
	tagName: 'sharingReasons',
	parent: 'CustomObject',
	key: 'fullName'
}, {
	xmlName: 'SharingCriteriaRule',
	tagName: 'sharingCriteriaRules',
	parent: 'SharingRules',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'SharingOwnerRule',
	tagName: 'sharingOwnerRules',
	parent: 'SharingRules',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'ListView',
	tagName: 'listViews',
	parent: 'CustomObject',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'FieldSet',
	tagName: 'fieldSets',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowFieldUpdate',
	tagName: 'fieldUpdates',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowKnowledgePublish',
	tagName: 'knowledgePublishes',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowFlowAction',
	tagName: 'flowActions',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowTask',
	tagName: 'tasks',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowAlert',
	tagName: 'alerts',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowOutboundMessage',
	tagName: 'outboundMessages',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'WorkflowRule',
	tagName: 'rules',
	parent: 'Workflow',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'MatchingRule',
	tagName: 'matchingRules',
	parent: 'MatchingRules',
	key: 'fullName',
	isNamed: true
}, {
	xmlName: 'CustomLabel',
	tagName: 'labels',
	parent: 'CustomLabel',
	key: 'fullName',
	isNamed: true,
	notCustomObjectRelated: true
}, {
	xmlName: 'PermissionSetApplicationVisibility',
	tagName: 'applicationVisibilities',
	parent: 'PermissionSet',
	key: 'application'
}, {
	xmlName: 'PermissionSetApexClassAccess',
	tagName: 'classAccesses',
	parent: 'PermissionSet',
	key: 'apexClass'
}, {
	xmlName: 'PermissionSetApexPageAccess',
	tagName: 'pageAccesses',
	parent: 'PermissionSet',
	key: 'apexPage'
}, {
	xmlName: 'PermissionSetCustomPermissions',
	tagName: 'customPermissions',
	parent: 'PermissionSet',
	key: 'name'
}, {
	xmlName: 'PermissionSetExternalDataSourceAccess',
	tagName: 'externalDataSourceAccesses',
	parent: 'PermissionSet',
	key: 'externalDataSource'
}, {
	xmlName: 'PermissionSetFieldPermissions',
	tagName: 'fieldPermissions',
	parent: 'PermissionSet',
	key: 'field'
}, {
	xmlName: 'PermissionSetObjectPermissions',
	tagName: 'objectPermissions',
	parent: 'PermissionSet',
	key: 'object'
}, {
	xmlName: 'PermissionSetRecordTypeVisibility',
	tagName: 'recordTypeVisibilities',
	parent: 'PermissionSet',
	key: 'recordType'
}, {
	xmlName: 'PermissionSetTabSetting',
	tagName: 'tabSettings',
	parent: 'PermissionSet',
	key: 'tab'
}, {
	xmlName: 'PermissionSetUserPermission',
	tagName: 'userPermissions',
	parent: 'PermissionSet',
	key: 'name'
}, {
	xmlName: 'ProfileApplicationVisibility',
	tagName: 'applicationVisibilities',
	parent: 'Profile',
	key: 'application'
}, {
	xmlName: 'ProfileApexClassAccess',
	tagName: 'classAccesses',
	parent: 'Profile',
	key: 'apexClass'
}, {
	xmlName: 'ProfileApexPageAccess',
	tagName: 'pageAccesses',
	parent: 'Profile',
	key: 'apexPage'
}, {
	xmlName: 'ProfileCustomPermissions',
	tagName: 'customPermissions',
	parent: 'Profile',
	key: 'name'
}, {
	xmlName: 'ProfileExternalDataSourceAccess',
	tagName: 'externalDataSourceAccesses',
	parent: 'Profile',
	key: 'externalDataSource'
}, {
	xmlName: 'ProfileFieldLevelSecurity',
	tagName: 'fieldPermissions',
	parent: 'Profile',
	key: 'field'
}, {
	xmlName: 'ProfileLayoutAssignments',
	tagName: 'layoutAssignments',
	parent: 'Profile',
	key: 'layout'
}, {
	xmlName: 'ProfileObjectPermissions',
	tagName: 'objectPermissions',
	parent: 'Profile',
	key: 'object'
}, {
	xmlName: 'ProfileRecordTypeVisibility',
	tagName: 'recordTypeVisibilities',
	parent: 'Profile',
	key: 'recordType'
}, {
	xmlName: 'ProfileTabVisibility',
	tagName: 'tabVisibilities',
	parent: 'Profile',
	key: 'tab'
}, {
	xmlName: 'ProfileUserPermission',
	tagName: 'userPermissions',
	parent: 'Profile',
	key: 'name'
}];

var metadataTypesAdditions = [];

var DescribeMetadataService = module.exports = function(describeMetadataResult) {
	var self = this;
	self.describeMetadataResult = describeMetadataResult ? describeMetadataResult : require('./describe-metadata-result.json');
	self.metadataObjectsExtended = [];
	if (!self.describeMetadataResult.metadataObjects) {
		self.describeMetadataResult.metadataObjects = [];
	}
	self.describeMetadataResult.metadataObjects.forEach(function(metadataObject) {
		var additionalChildTypes = _.where(childTypes, {
			'parent': metadataObject.xmlName
		});
		var addition = _.findWhere(metadataTypesAdditions, {
			xmlName: metadataObject.xmlName
		});
		if (addition) {
			metadataObject = _.extend(metadataObject, addition);
		}
		if (additionalChildTypes && additionalChildTypes.length) {
			if (!metadataObject.childXmlNames) {
				metadataObject.childXmlNames = [];
			}
			metadataObject.childXmlNames = _.uniq(metadataObject.childXmlNames.concat(_.pluck(additionalChildTypes, 'xmlName')));
		}
		if (metadataObject.childXmlNames) {
			metadataObject.childXmlNames.forEach(function(childXmlName) {
				var childMetadataType = {
					directoryName: metadataObject.directoryName,
					inFolder: metadataObject.inFolder,
					metaFile: metadataObject.metaFile,
					xmlName: childXmlName
				};
				var childType = _.findWhere(childTypes, {
					'xmlName': childXmlName
				});
				if (childType) {
					childMetadataType.parent = childType.parent;
					childMetadataType.tagName = childType.tagName;
					childMetadataType.key = childType.key;
					childMetadataType.isNamed = typeof childType.isNamed === 'boolean' ? childType.isNamed : false;
					childMetadataType.notCustomObjectRelated = typeof childType.notCustomObjectRelated === 'boolean' ? childType.notCustomObjectRelated : false;
				}
				if (metadataObject.suffix) {
					childMetadataType.suffix = metadataObject.suffix;
				}
				self.metadataObjectsExtended.push(childMetadataType);
			});
		}
		self.metadataObjectsExtended.push(metadataObject);
	});
};

DescribeMetadataService.prototype.getTypes = function() {
	var self = this;
	return self.metadataObjectsExtended;
};

DescribeMetadataService.prototype.getType = function(xmlName) {
	var self = this;
	return _.findWhere(self.metadataObjectsExtended, {
		xmlName: xmlName
	});
};

DescribeMetadataService.prototype.getTypeNames = function() {
	var self = this;
	return _.pluck(self.metadataObjectsExtended, 'xmlName');
};

DescribeMetadataService.prototype.getDirectoryNames = function() {
	var self = this;
	return _.unique(_.pluck(self.metadataObjectsExtended, 'directoryName'));
};

DescribeMetadataService.prototype.getTypesForDirectoryName = function(directoryName) {
	var self = this;
	return _.where(self.metadataObjectsExtended, {
		directoryName: directoryName
	});
};

DescribeMetadataService.prototype.getTypeForFilepath = function(filepath) {
	var self = this;
	var directoryName = path.basename(path.dirname(filepath));
	var parentDirectoryName = path.basename(path.dirname(path.dirname(filepath)));
	var extname = path.extname(filepath).split('.')[1];
	if (!extname) {
		extname = '';
	}
	var directoryMatches = self.getTypesForDirectoryName(directoryName);
	var parentDirectoryMatches = self.getTypesForDirectoryName(parentDirectoryName);
	var matches = _.unique([].concat(directoryMatches, parentDirectoryMatches));
	if (matches.length > 1) {
		// find the container metadata type
		return _.find(matches, function(item) {
			return item.childXmlNames;
		});
	} else {
		return matches[0];
	}
};
