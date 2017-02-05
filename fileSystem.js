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

var currentFolderId = 0;

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