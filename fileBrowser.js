/**
 * Created by zhannalibman on 31/01/2017.
 */

"use strict";

var currentFolderId = 0;

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

/**
 * Handles the click on the folder in the explorer
 * */
function onFolderClick(event){
    event.stopPropagation();
    $(this).toggleClass("collapsed");
    const elementId = $(this).attr("data-id");
    showFolderContentById(elementId);
}

/**
 * Finds current folder by id and prints it
 * @param folderId - the id of the folder
 * */
function showFolderContentById(folderId){
    const folderToPrint = findElementById(folderId);
    displayFolderContent(folderToPrint);
}

function displayFolderContent (folderElement){
    var contentDiv  = clearAndReturnContentDiv();
    var folderContent = sortFolderContent(folderElement.children);
    for (var i = 0; i < folderContent.length; i++) {
        var contentItem = $("<div data-id="+folderContent[i].id+">" + folderContent[i].name + "</div>")
        if (isFolder(folderContent[i])){
            contentItem.addClass("contentFolder");
        }  else {
            contentItem.addClass("contentFile");
        }
        contentDiv.append(contentItem);
        contentItem.click(onContentItemClick);
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

function onContentItemClick(){
    var elementId = $(this).attr("data-id");
    var element = findElementById(elementId);
    if (isFolder(element)){
        displayFolderContent(element);
    } else {
        openFile(element);
    }
}
/**
 * Displays file content in content side
 * @param fileElement - object of the file from fsStorage
 * */
function openFile(fileElement){
    var contentDiv = clearAndReturnContentDiv();
    if (fileElement.content != undefined && fileElement.content != null){
        contentDiv.text(fileElement.content);
    }
}

function clearAndReturnContentDiv(){
    var contentDiv  = $("#content");
    contentDiv.empty();
    return contentDiv;
}