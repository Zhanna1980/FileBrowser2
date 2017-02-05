/**
 * Created by zhannalibman on 31/01/2017.
 */

"use strict";


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
 * Finds current folder by id and prints it
 * @param folderId - the id of the folder
 * */
function printFolderContentById(folderId){
    var contentDiv  = $("#content");
    contentDiv.empty();
    const folderToPrint = findElementById(folderId);
    var folderContent = sortFolderContent(folderToPrint.children);
    for (var i = 0; i < folderContent.length; i++) {
        var contentItem = $("<div>" + folderContent[i].name + "</div>")
        if (isFolder(folderContent[i])){
            contentItem.addClass("contentFolder");
        }  else {
            contentItem.addClass("contentFile");
        }
        contentDiv.append(contentItem);
    }
}

function sortFolderContent(folderContent){
    //sorting by folder/file and alphabetically
    var sortedFolderContent = folderContent.sort(function(a,b){
        return (isFolder(a) == isFolder(b)) ? (a.name > b.name) : (isFolder(a) < isFolder(b)) });
    return sortedFolderContent;
}