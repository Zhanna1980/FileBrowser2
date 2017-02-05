/**
 * Created by zhannalibman on 31/01/2017.
 */


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

$(document).ready(function () {
    var rootUl = $("#fs");
    printFS(fsStorage[0], rootUl);
});

function printFS(element, parentInDOM){

    if (element.children !== undefined){
        var elementInDom = $("<li data-id="+element.id+"><a href='#'>" + element.name +  "</a></li>");
        elementInDom.appendTo(parentInDOM);
        elementInDom.addClass("folder collapsed");
        var ul = $('<ul></ul>');
        ul.appendTo(elementInDom);

        elementInDom.off("click");
        elementInDom.click(toggleExpandCollapse);
        for (var i = 0; i < element.children.length; i++){
            printFS(element.children[i], ul);
        }
    }
}

function toggleExpandCollapse(event){
    event.stopPropagation();
    $(this).toggleClass("collapsed");
    const elementId = $(this).attr("data-id");
    printFolderContentById(elementId);

}

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
 * Finds current folder by id and prints it
 * @param folderId - the id of the folder
 * */
function printFolderContentById(folderId){
    var contentDiv  = $("#content");
    contentDiv.empty();
    const folderToPrint = findElementById(folderId);
    var folderContent = folderToPrint.children;
    //sorting by folder/file and alphabetically
    var sortedFolderContent = folderContent.sort(function(a,b){
        return (isFolder(a) == isFolder(b)) ? (a.name > b.name) : (isFolder(a) < isFolder(b)) });
    for (var i = 0; i < sortedFolderContent.length; i++) {
        var contentItem = $("<div>" + sortedFolderContent[i].name + "</div>")
        if (isFolder(sortedFolderContent[i])){
            contentItem.addClass("contentFolder");
        }  else {
            contentItem.addClass("contentFile");
        }
        contentDiv.append(contentItem);
    }
}