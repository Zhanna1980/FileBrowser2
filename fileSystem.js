/**
 * Created by zhannalibman on 05/02/2017.
 */

var fileSystem = (function () {

    "use strict";

    var fsStorage = [];
    var lastAddedId = 6;

    loadData();

    /**
     * Loads saved data from localStorage
     * or if there is no saved data in localStorage assigns default value for fsStorage.
     * */
    function loadData() {
        try {
            const fsStorageAsArray = JSON.parse(localStorage.getItem("saveArray"));
            fromSaveFormat(fsStorageAsArray);
        } catch (err) {
            // fill some initial data
            fsStorage = [
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
        }
    }

    /**
     * Checks that the element is a folder
     * @param element - object in fsStorage
     * @return Boolean - true if the element is a folder and false if it is a file
     * */
    function isFolder(element) {
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
     * Finds element and parent element by id of the element
     * @param elementId - the id of the element.
     * @return object with element and its parent.
     * */
    function findElementAndParentById(elementId) {
        return findElementRecursive(elementId, fsStorage[0], null);
    }

    /**
     * Searches recursively for an element in fsStorage
     * @param id - integer which is stored in element.id
     * @param element - object from which the function starts search
     * @param parent - parent object of element
     * @return object with element with given id and with parent element.
     * */
    function findElementRecursive(id, element, parent) {
        if (element.id == id) {
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

    /**
     * Checks if given folders has subfolders.
     * @param folder - the folder element.
     * @return Boolean: true if it has subfolders and false if it has not.
     * */
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
     * @return Array, sorted by folder/file and alphabetically.
     * */
    function sortFolderContent(folderContent) {
        var sortedFolderContent = folderContent.sort(function (a, b) {
            //if both file or folder
            if(isFolder(a) == isFolder(b))
            {
                return (a.name).localeCompare(b.name);
            }

            return isFolder(a) ? -1 : 1;
        });
        return sortedFolderContent;
    }

    /**
     * Searches for a child element with a given name.
     * @param childName - String, the name of the element that is searched for .
     * @param parentElement - the folder to search into.
     * @return childElement or null if parentElement doesn't contain childElement with the given name.
     **/
    function findChildByName(childName, parentElement) {
        if (isFolder(parentElement)) {
            for (var i = 0; i < parentElement.children.length; i++) {
                if (parentElement.children[i].name === childName) {
                    return parentElement.children[i];
                }
            }
        }
        return null;
    }

    /**
     * Find element by given path.
     * @param path - String that represents an address in fsStorage.
     * @return element or null if it was not found (invalid or wrong path).
     * */
    function findItemByPath(path) {
        var trimmedPath = path.trim();
        var elementsInPath = trimmedPath.split("/");
        if (elementsInPath[elementsInPath.length - 1] == "") {
            elementsInPath.pop();
        }
        var currentElement = null;
        if (elementsInPath.length > 0 && elementsInPath[0] == "root") {
            currentElement = fsStorage[0];
        } else {
            return null;
        }
        for (var i = 1; i < elementsInPath.length; i++) {
            currentElement = findChildByName(elementsInPath[i], currentElement);
            if (currentElement == null) {
                return null;
            }
        }
        return currentElement;
    }

    /**
     * Generates path by element id
     * @param elementId - the id of the element.
     * @return String that represents the path.
     * */
    function generatePathByElementId(elementId) {
        var path = generatePathByElement(findElementById(elementId));
        // removes starting '/'
        return path.substr(1);
    }

    /**
     * Generates path by element. Implementation detail of generatePathByElementId. Do not call directly.
     * @param element - object in the fsStorage.
     * @return String that represents the path (starting with '/').
     * */
    function generatePathByElement(element) {
        if (element == null) {
            return "";
        }
        var parent = findParentByElementId(element.id);
        return generatePathByElement(parent) + "/" + element.name;
    }

    /**
     * Deletes element from fileStorage.
     * @param elementId - the id of the element that will be deleted.
     * */
    function deleteElement(elementId) {
        var parent = findParentByElementId(elementId);
        if (parent == null) {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            if (parent.children[i].id == elementId) {
                parent.children.splice(i, 1);
                return;
            }
        }
        saveData();
    }

    /**
     * Renames element.
     * @param elementId - the id of the element to be renamed.
     * @param newName - String, the new element name.
     * */
    function renameElement(elementId, newName) {
        if (newName == undefined || newName.length == 0) {
            throw new Error("Invalid element name.")
        } else if (elementId == 0) {
            fsStorage[0].name = newName;
        } else {
            var elementAndParent = findElementRecursive(elementId, fsStorage[0], null);
            if (findChildByName(newName, elementAndParent.parent) == null) {
                elementAndParent.element.name = newName;
            } else {
                throw new Error("Element with such name already exists.");
            }
        }
        saveData();
    }

    /**
     * Find unique name for file/folder. For "inner" use.
     * */
    function getUniqueName(elementName, parent) {
        var counter = 0;
        var elementNameExists = true;
        while (elementNameExists) {
            var possibleName = counter > 0 ? (elementName + "(" + counter + ")") : elementName;
            if (findChildByName(possibleName, parent) == null) {
                return possibleName;
            }
            counter++;
        }
    }

    /**
     * Creates new file or folder.
     * @param parentId - the id of the parent folder to which a new element will be appended.
     * @param type - String ("folder" or "file").
     * */
    function createFileOrFolder(parentId, type) {
        var parent = findElementById(parentId);
        var newElementName = type == "folder" ? "new folder" : "new file.txt";
        var newName = getUniqueName(newElementName, parent);
        var newElement = {id: ++lastAddedId, name: newName};
        if (type == "file") {
            newElement.content = "";
        } else {
            newElement.children = [];
        }
        parent.children.push(newElement);
        saveData();
    }

    /**
     * gets root element.
     * @return root element.
     * */
    function getRoot() {
        return fsStorage[0];
    }

    /**
     * Converts fsStorage to flat array.
     * @param element - element of fsStorage. First time the function is called with root element (fsStorage[0])
     * @param parent - parent element. First time the function is called with null
     * @return Array - objects of fsStorage in flat array
     * */
    function toSaveFormat(element, parent) {
        var saveArray = [objToSaveFormat(element, parent)];
        if (isFolder(element)) {
            for (var i = 0; i < element.children.length; i++) {
                var arr = toSaveFormat(element.children[i], element);
                saveArray = saveArray.concat(arr);
            }
        }
        return saveArray;
    }

    /**
     * Converts the element to object for array
     * @param obj - object at the runtime format
     * @param parent - parent element of the given object
     * @return object at the save format
     * */
    function objToSaveFormat(obj, parent) {
        const parentId = parent === null ? null : parent.id;
        const type = isFolder(obj) ? "folder" : "file";
        var element = {id: obj.id, parent: parentId, name: obj.name, type: type};
        if (obj.content != undefined) {
            element.content = obj.content;
        }
        return element;
    }


    /**
     * Converts the object from flat array to object which is suitable for fsStorage as object.
     * @param objectInArray - object from saved array
     * @return object at the runtime format
     * */
    function objFromSaveFormat(objectInArray) {
        var objectInTree = {id: objectInArray.id, name: objectInArray.name};
        if (objectInArray.type == "folder") {
            objectInTree.children = [];
        } else if (objectInArray.content != undefined) {
            objectInTree.content = objectInArray.content;
        }
        return objectInTree;
    }

    /**
     * Converts flat array to fsStorage object
     * @param arr - fsStorage as array (saved format)
     * */
    function fromSaveFormat(arr) {
        fsStorage = [];
        fsStorage.push(objFromSaveFormat(arr[0]));// "root" always goes first in the array
        lastAddedId = 0;
        for (var i = 1; i < arr.length; i++) {
            //parent is always before child in the array
            findElementById(arr[i].parent).children.push(objFromSaveFormat(arr[i]));
            if (arr[i].id > lastAddedId) {
                lastAddedId = arr[i].id;
            }
        }
    }

    /**
     * Converts data to a save format and saves it in the localStorage.
     * */
    function saveData() {
        try {
            const fsStorageAsArray = toSaveFormat(fsStorage[0], null);
            localStorage.setItem("saveArray", JSON.stringify(fsStorageAsArray));
        } catch(err) {
            alert("Error occurred while saving the data");
        }
    }

    return {
        getRoot: getRoot,
        isFolder: isFolder,
        findElementById: findElementById,
        findParentByElementId: findParentByElementId,
        findElementAndParentById: findElementAndParentById,
        hasSubfoldersById: hasSubfoldersById,
        hasSubfolders: hasSubfolders,
        sortFolderContent: sortFolderContent,
        findItemByPath: findItemByPath,
        generatePathByElementId: generatePathByElementId,
        deleteElement: deleteElement,
        renameElement: renameElement,
        createFileOrFolder: createFileOrFolder
    };
})();