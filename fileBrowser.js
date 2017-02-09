/**
 * Created by zhannalibman on 31/01/2017.
 */

"use strict";

var navigationHistory = [];
var currentFolderId = 0;

$(document).ready(function () {
    var rootUl = $("#fs");
    showFoldersTree(fsStorage[0], rootUl);
    showFolderContentById(0);
});

/**
 * Shows fsStorage tree in explorer
 * */
function showFoldersTree(element, parentInDOM){
    if (element.children !== undefined){
        var elementInDom = $("<li><div class='image'/>" + " " +
            "<a href='#' data-id="+element.id+">" + element.name +  "</a></li>");
        elementInDom.appendTo(parentInDOM);
        hasSubfolders(element) ? elementInDom.addClass("folder collapsed") : elementInDom.addClass("folder");
        var ul = $('<ul></ul>');
        ul.appendTo(elementInDom);
        elementInDom.find("div").click(onFolderIconClick);
        elementInDom.find("a").click(onFolderNameClick);
        for (var i = 0; i < element.children.length; i++){
            showFoldersTree(element.children[i], ul);
        }
    }
}

function onFolderNameClick(){
    $(this).siblings('div').click();
    const elementId = $(this).attr("data-id");
    showFolderContentById(elementId);
}
/**
 * Handles the click on the folder icon in the explorer
 * */
function onFolderIconClick(){
    const folderId = $(this).siblings('a').attr("data-id");
    if (hasSubfoldersById(folderId)) {
        $(this).parent().toggleClass("collapsed");
    }
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
        var contentItem = $("<div data-id="+folderContent[i].id+"><div>" + folderContent[i].name + "</div></div>");
        contentItem.addClass("contentItem");
        if (isFolder(folderContent[i])){
            $("<img src='_images/folder.png'/>").prependTo(contentItem);
        }  else {
            $("<img src='_images/file.png'/>").prependTo(contentItem);
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
    var displayFileTemplate = `<div class="fileDisplay">
                                    <textarea class="editFile" value="" autofocus/>
                                    <div class="editFileButtonsLayer">
                                        <button class="cancel">Cancel</button>
                                        <button class="ok">OK</button>
                                    </div>
                                </div>`;
    var displayFile = $(displayFileTemplate);
    var contentDiv  = $("#content");
    contentDiv.append(displayFile);
    var displayFileTextArea = displayFile.find(".editFile");
    var btnCancel = displayFile.find(".cancel");
    btnCancel.click(closeDisplayFile);
    var btnOk = displayFile.find(".ok");
    btnOk.attr("data-id", fileElement.id);
    btnOk.click(function () {
        saveChangesInFile.call(this);
        closeDisplayFile.call(this);
    });
    if (fileElement.content != undefined && fileElement.content != null){
        displayFileTextArea.text(fileElement.content);
    }
}

function saveChangesInFile() {
    var fileId = $(this).attr("data-id");
    var editedText = $("textarea.editFile").val();
    var file = findElementById(fileId);
    file.content = editedText;
    // console.log(fileId);
}

function closeDisplayFile(){
    var displayFile = $(this).parents(".fileDisplay");
    displayFile.remove();
}

function clearAndReturnContentDiv(){
    var contentDiv  = $("#content");
    contentDiv.empty();
    return contentDiv;
}