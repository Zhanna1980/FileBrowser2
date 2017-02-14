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
];

var lastAddedId = 6;

/**
 * Checks that the element is a folder
 * @param element - object in fsStorage
 * @return Boolean - true if the element is a folder and false if it is a file
 * */
function isFolder (element){
    return element.children !== undefined;
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
    if ( elementsInPath.length > 0 && elementsInPath[0] == "root") {
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

function deleteElementFromFileSystem (elementId) {
    var parent = findParentByElementId(elementId);
    if (parent == null) {
        return;
    }
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id == elementId) {
            parent.children.splice(i, 1);
            console.log(findElementById(elementId));
            return;
        }
    }

}

function renameElement(elementId, newName) {
    if (newName == undefined || newName.length == 0) {
        throw new Error ("Invalid element name.")
    } else if (elementId == 0){
        fsStorage[0].name = newName;
        console.log (fsStorage[0].name);
    } else {
        var elementAndParent = findElementRecursive(elementId, fsStorage[0], null);
        if (findChildByName(newName, elementAndParent.parent) == null) {
            elementAndParent.element.name = newName;
            console.log (elementAndParent.element.name);
        } else {
            throw new Error ("Element with such name already exists.");
        }
    }

}

function getNameMatchCounter (elementName, parent) {
    var counter = 0;
    var found = true;
    while (found) {
        var searchName = counter > 0 ? (elementName + "(" + counter + ")") : elementName;
        if (findChildByName(searchName, parent) == null) {
            found = false;
            return counter;
        } else {
            found = true;
            counter++;
        }
    }
}

/**
 * */
function createFileOrFolder(parentId, type) {
    var parent = findElementById(parentId);
    var newElementName = type == "folder" ? "new folder" : "new_file.txt";
    var nameMatchCounter = getNameMatchCounter(newElementName, parent);
    var nameForAdding = nameMatchCounter == 0 ? newElementName : (newElementName + "(" + nameMatchCounter + ")");
    var newElement = {id: ++lastAddedId, name: nameForAdding};
    if (type == "file"){
        newElement.content = "";
    } else {
        newElement.children = [];
    }
    parent.children.push(newElement);
    console.log(parent.children);
}

