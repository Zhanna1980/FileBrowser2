/**
 * Created by zhannalibman on 31/01/2017.
 */
(function ($) {

"use strict";
//the array that keeps the ids of opened folders and files
var navigationHistory = [];
var navigationHistoryCurrentElementIndex = -1;

$(document).ready(function () {
    initialDisplay();
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
    if (navigationHistoryCurrentElementIndex > 0){
        if(!showFolderOrFileContentById(navigationHistory[--navigationHistoryCurrentElementIndex], true))
        {
            alert("Folder/file you want to open doesn't exist." +
                " The previous folder/file (if it exists) will be opened.");
            back();
        }
    }
}

function forward() {
    if (navigationHistoryCurrentElementIndex >= navigationHistory.length - 1) {
        return;
    }

    if(!showFolderOrFileContentById(navigationHistory[++navigationHistoryCurrentElementIndex], true))
    {
        alert("Folder/file you want to open doesn't exist." +
            " The previous folder/file (if it exists) will be opened.");
        forward();
    }

}

/**
 * Updates the history array and currentElementId
 * */
function updateHistory(elementId) {
    if(navigationHistoryCurrentElementIndex != -1 && navigationHistory[navigationHistoryCurrentElementIndex] == elementId) {
        return;
    }
    navigationHistory.splice(++navigationHistoryCurrentElementIndex, 0, elementId);
    navigationHistory.splice(navigationHistoryCurrentElementIndex+1);
    for (var i = 0; i < navigationHistory.length; i++){
        console.log(navigationHistory[i]);
    }
    console.log("currElInd =", navigationHistoryCurrentElementIndex);
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
    var contentDiv  = $("#content");
    contentDiv.append(displayFile);
    var displayFileTextArea = displayFile.find(".editFile");
    displayFile.find(".cancel").click(closeDisplayFile);
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
    var file = findElementById(fileId);
    file.content = editedText;
    // updateHistory(navigationHistory[navigationHistory.length - 2]);
    // displayPath(navigationHistory[navigationHistory.length - 2]);
}

function closeDisplayFile(){
    var displayFile = $(this).parents(".fileDisplay");
    displayFile.remove();
    // updateHistory(navigationHistory[navigationHistory.length - 2]);
    // displayPath(navigationHistory[navigationHistory.length - 2]);
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
    var newFolder = $("<div class='menuItem'>New folder</div>");
    var newFile = $("<div class='menuItem'>New file</div>");
    var deleteFileOrFolder = $("<div class='menuItem'>Delete</div>");
    var rename = $("<div class='menuItem'>Rename</div>");
    rename.click(renameItem);
    var id;
    if (target.is("li")){
        id = target.children('a').attr('data-id');
        menu.append(newFolder);
        menu.append(deleteFileOrFolder);
        menu.append(rename);

    } else if (target.is("#content")){
        if ($(".fileDisplay").length !== 0){
            menu.empty();
            return;
        }
        menu.append(newFolder);
        menu.append(newFile);

    } else if (target.is(".contentItem")){
        id = target.attr('data-id');
        var type = $(target).attr("data-type");
        if (type == "folder"){
            menu.append(newFolder);
        }
        menu.append(deleteFileOrFolder);
        menu.append(rename);
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
    item.name = editedItemName;
}

function  displayPath(elementId) {
    var path = generatePathByElementId(elementId);
    var inputPath = $("#path");
    inputPath.val(path);
}

function showFolderOrFileContentById(elementId, skipHistory) {
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
        updateHistory(elementId);
    }

    displayPath(elementId);
    return true;
}

})(jQuery);


