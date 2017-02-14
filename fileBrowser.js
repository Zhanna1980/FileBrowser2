/**
 * Created by zhannalibman on 31/01/2017.
 */
(function ($) {

"use strict";

// var navigationHistory = [];
// var navigationHistoryCurrentElementIndex = -1;

$(document).ready(function () {
    initialDisplay();
    $('.layout').contextmenu(function () { return false; });
    $(window).click(hideContextMenu);
    $("#content").contextmenu(function (event) {
        showContextMenu(event);
        return false;
    });
    $("#path").on('keydown', function (event) {
        //if enter was pressed
        if (event.keyCode == 13) {
            var path = $(this).val();
            var element = findItemByPath(path);
            if(element != null) {
                showFolderOrFileContentById(element.id);
            }
        }
    });
    $("#btnBack").click(back);
    $("#btnForward").click(forward);
});

function initialDisplay() {
    var rootUl = $("#fs");
    showFoldersTree(fsStorage[0], rootUl);
    showFolderOrFileContentById(0);
}

function back() {
    if (navigationHistory.getCurrentId() == undefined){
        return;
    }
    if (!showFolderOrFileContentById(navigationHistory.back(), true)) {
        alert("Folder/file you want to open doesn't exist." +
            " The previous folder/file (if it exists) will be opened.");
        back();
    }
    navigationHistory.log();
}

function forward() {
    if (navigationHistory.getCurrentId() == undefined) {
        return;
    }
    if (!showFolderOrFileContentById(navigationHistory.forward(), true)) {
        alert("Folder/file you want to open doesn't exist." +
            " The next folder/file (if it exists) will be opened.");
        forward();
    }
    navigationHistory.log();
}

/**
 * Shows fsStorage tree in explorer
 * */
function showFoldersTree(element, parentInDOM){
    if (element.children !== undefined){
        var ul = createFoldersListElement(element, parentInDOM).find("ul");
        for (var i = 0; i < element.children.length; i++){
            showFoldersTree(element.children[i], ul);
        }
    }
}

/**Creates single "li" object and attaches it to a parent ul.
 * @param element - element in fsStorage.
 * @param parentInDOM - parent "ul" to which the newly created "li" is attached
 * @return the newly created "li".
 * */
function createFoldersListElement(element, parentInDOM) {
    var elementInDom = $("<li><div class='image'/>" + " " +
        "<a href='#' data-id="+element.id+">" + element.name +  "</a></li>");
    elementInDom.appendTo(parentInDOM);
    hasSubfolders(element) ? elementInDom.addClass("folder collapsed") : elementInDom.addClass("folder");
    var ul = $('<ul></ul>');
    ul.appendTo(elementInDom);
    elementInDom.find("div").click(onFolderIconClick);
    elementInDom.find("a").click(onFolderNameClick);
    elementInDom.contextmenu(function (event) {
        showContextMenu(event);
        return false;
    });
    return elementInDom;
}

function onFolderNameClick(){
    var clickedLink = $(this);
    if (clickedLink.closest("li").hasClass("collapsed")) {
        clickedLink.siblings('div').click();
    }
    const elementId = $(this).attr("data-id");
    showFolderOrFileContentById(elementId);
    // processElementId(elementId);
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

function displayFolderContent (folderElement){
    var contentDiv  = clearAndReturnContentDiv();
    var folderContent = sortFolderContent(folderElement.children);
    for (var i = 0; i < folderContent.length; i++) {
        var contentItem = $("<div data-id='"+folderContent[i].id+"'><div>" + folderContent[i].name + "</div></div>");
        contentItem.addClass("contentItem");
        contentItem.contextmenu(function (event) {
            showContextMenu(event);
            return false;
        });
        if (isFolder(folderContent[i])){
            contentItem.attr("data-type", "folder");
            $("<img src='_images/folder.png'/>").prependTo(contentItem);
        }  else {
            contentItem.attr("data-type", "file");
            $("<img src='_images/file.png'/>").prependTo(contentItem);
        }
        contentDiv.append(contentItem);
        contentItem.click(onContentItemClick);
    }
}

function onContentItemClick(){
    var elementId = $(this).attr("data-id");
    showFolderOrFileContentById(elementId);
    // processElementId(elementId);
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
                                        <button class="save">Save</button>
                                    </div>
                                </div>`;
    var displayFile = $(displayFileTemplate);
    var contentDiv  = clearAndReturnContentDiv();
    contentDiv.append(displayFile);
    var displayFileTextArea = displayFile.find(".editFile");
    displayFile.find(".cancel")
        .attr("data-id", fileElement.id)
        .click(closeDisplayFile);
    displayFile.find(".save")
        .attr("data-id", fileElement.id)
        .click(function () {
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
    var fileAndParent = findElementRecursive(fileId, fsStorage[0], null);
    var file = fileAndParent.element;
    file.content = editedText;
    var parent = fileAndParent.parent;
    if (parent != null) {
        showFolderOrFileContentById(parent.id);
        // processElementId(parent.id);
    }
}

function closeDisplayFile(){
    var fileId = $(this).attr("data-id");
    var parent = findParentByElementId(fileId);
    if (parent != null) {
        showFolderOrFileContentById(parent.id);
    }
}

function clearAndReturnContentDiv(){
    var contentDiv  = $("#content");
    contentDiv.empty();
    return contentDiv;
}

function showContextMenu(event){
    var menu = $(".menu");
    menu.empty();
    var target = $(event.currentTarget);
    var newFolder = $("<div class='menuItem'>New folder</div>").click(createNewFolder);
    var newFile = $("<div class='menuItem'>New file</div>").click(createNewFile);
    var deleteFileOrFolder = $("<div class='menuItem'>Delete</div>").click(deleteElement);
    var rename = $("<div class='menuItem'>Rename</div>").click(renameItem);
    var id;
    if (target.is("li")){
        id = target.children('a').attr('data-id');
        menu.attr("data-id", id)
            .append(newFolder)
            .append(rename);
        if (id > 0){
            menu.append(deleteFileOrFolder);
        }
    } else if (target.is("#content")){
        if ($(".fileDisplay").length !== 0){
            menu.empty();
            return;
        }
        menu.attr("data-id", navigationHistory.getCurrentId())
            .append(newFolder)
            .append(newFile);
    } else if (target.is(".contentItem")){
        id = target.attr('data-id');
        var type = $(target).attr("data-type");
        if (type == "folder"){
            menu.append(newFolder);
            menu.append(newFile);
        }
        menu.attr("data-id", id)
            .append(deleteFileOrFolder)
            .append(rename);
    }
    menu.css('display', 'block');
    menu.css('left', event.pageX + 'px');
    menu.css('top', event.pageY + 'px');
    menu.attr("data-id", id);
}

function hideContextMenu() {
    var menu = $('.menu');
    menu.empty();
    menu.css('display', 'none');
}

function renameItem(){
    var id = $(this).parent().attr("data-id");
    var item = findElementById(id);
    var editedItemName = prompt("Please enter the  new name", item.name);
    try {
        renameElement(id, editedItemName);
    } catch (err) {
        alert(err.message);
    }
    updateUI();
}

function deleteElement(){
    var id = $(this).parent().attr("data-id");
    if (id == 0) {
        alert("Root can not be deleted.");
        return;
    }
    var userConfirmed = confirm("Are you sure?");
    if (userConfirmed) {
        deleteElementFromFileSystem(id);
        updateUI();
    }
}

function createNewFile(){
    var id = $(this).parent().attr("data-id");
    createFileOrFolder(id, "file");
}

function createNewFolder(){
    var id = $(this).parent().attr("data-id");
    createFileOrFolder(id, "folder");
}

function updateUI(){

}

function  displayPath(elementId) {
    var path = generatePathByElementId(elementId);
    var inputPath = $("#path");
    inputPath.val(path);
}

function showFolderOrFileContentById(elementId, skipHistory) {
    if (!skipHistory && navigationHistory.getCurrentId() == elementId) {
        return true;
    }
    var element = findElementById(elementId);
    if(element == null) {
        return false;
    }
    if (isFolder(element)){
        displayFolderContent(element);
    } else {
        openFile(element);
    }
    if(!skipHistory) {
        navigationHistory.push(elementId);
        navigationHistory.log();
    }
    displayPath(elementId);
    return true;
}

})(jQuery);


