/**
 * Created by zhannalibman on 31/01/2017.
 */

"use strict";


$(document).ready(function () {
    var rootUl = $("#fs");
    showFoldersTree(fsStorage[0], rootUl);
});

function showFoldersTree(element, parentInDOM){
    if (element.children !== undefined){
        var elementInDom = $("<li data-id="+element.id+"><a href='#'>" + element.name +  "</a></li>");
        elementInDom.appendTo(parentInDOM);
        elementInDom.addClass("folder collapsed");
        var ul = $('<ul></ul>');
        ul.appendTo(elementInDom);

        elementInDom.off("click");
        elementInDom.click(onFolderClick);
        for (var i = 0; i < element.children.length; i++){
            showFoldersTree(element.children[i], ul);
        }
    }
}

function onFolderClick(event){
    event.stopPropagation();
    $(this).toggleClass("collapsed");
    const elementId = $(this).attr("data-id");
    showFolderContent(elementId);

}

/**
 * Finds current folder by id and prints it
 * @param folderId - the id of the folder
 * */
function showFolderContent(folderId){
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

/**
 * Sorts by folder/file and alphabetically.
 * @param folderContent - array of objects which are stored in given folder
 * */
function sortFolderContent(folderContent){
    var sortedFolderContent = folderContent.sort(function(a,b){
        return (isFolder(a) == isFolder(b)) ? (a.name > b.name) : (isFolder(a) < isFolder(b)) });
    return sortedFolderContent;
}