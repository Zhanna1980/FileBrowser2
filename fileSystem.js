/**
 * Created by zhannalibman on 05/02/2017.
 */
"use strict";

var fsStorage = [
    {
        id: 0, name: "root", children: [
        { id: 1, name: "sub1", children: [
            { id: 4, name: "file.txt"},
            { id: 5, name: "sub3", children: [
                {id: 6, name: "file2.txt", content: "content2"}
            ]}
        ]},
        { id: 2, name: "sub2", children: []},
        { id: 3, name: "file1.txt", content: "text"}
    ]
    }
]



/**
 * Checks that the element is a folder
 * @param element - object in fsStorage
 * @return true if the element is a folder and false if it is a file
 * */
function isFolder (element){
    return element.children;
}

/**
 * Finds element by its id
 * @param elementId - the id of the element
 * @return element object with given id
 * */
function findElementById(elementId) {
    return findElementRecursive(elementId, fsStorage[0], null).element;
}

/**
 * Finds parent element by id of the child element
 * @param elementId - the id of the child element.
 * @return parent object.
 * */
function findParentByElementId(elementId) {
    return findElementRecursive(elementId, fsStorage[0], null).parent;
}

/**
 * Searches recursively for an element in fsStorage
 * @param id - integer which is stored in element.id
 * @param element - object from which the function starts search
 * @param parent - parent object of element
 * @return object with element with given id and with parent element.
 * */
function findElementRecursive(id, element, parent) {
    if(element.id == id) {
        return {element: element, parent: parent};
    }
    if (isFolder(element)) {
        for (var i = 0; i < element.children.length; i++) {
            var result = findElementRecursive(id, element.children[i], element);
            if (result.element !== null) {
                return result;
            }
        }
    }
    return {element: null, parent: null};
}

/**
 * Checks if given folders has subfolders.
 * @param folderId - the id of the folder
 * @return Boolean: true if it has subfolders and false if it has not.
 * */
function hasSubfoldersById(folderId) {
    var folder = findElementById(folderId);
    return hasSubfolders(folder);
}

function hasSubfolders(folder) {
    if (isFolder(folder)) {
        for (var i = 0; i < folder.children.length; i++) {
            if (isFolder(folder.children[i])) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Sorts by folder/file and alphabetically.
 * @param folderContent - array of objects which are stored in given folder
 * */
function sortFolderContent(folderContent){
    var sortedFolderContent = folderContent.sort(function(a,b){
        return (isFolder(a) == isFolder(b)) ? (a.name > b.name) : (isFolder(a) < isFolder(b)) });
    return sortedFolderContent;
}

function findChildByName (childName, parentElement) {
    if (isFolder(parentElement)){
        for (var i = 0; i < parentElement.children.length; i++) {
            if (parentElement.children[i].name === childName) {
                return parentElement.children[i];
            }
        }
    }
    return null;
}

function findItemByPath(path) {
    var trimmedPath = path.trim();
    var elementsInPath = trimmedPath.split("/");
    if (elementsInPath[elementsInPath.length - 1] == "") {
        elementsInPath.pop();
    }
    var currentElement = null;
    if (elementsInPath.length == 0) {
        return null;
    } else if ( elementsInPath[0] == "root") {
        currentElement = fsStorage[0];
    } else {
        return null;
    }
    for (var i = 1; i < elementsInPath.length; i++) {
        currentElement = findChildByName(elementsInPath[i], currentElement);
        if (currentElement == null){
            return null;
        }
    }
    return currentElement;
}

function generatePathByElementId (elementId) {
    var path = generatePathByElement(findElementById(elementId));
    // removes starting '/'
    return path.substr(1);
}

function generatePathByElement (element) {
    if(element == null) {
        return "";
    }
    var parent = findParentByElementId(element.id);
    return generatePathByElement(parent) + "/" + element.name;
}

