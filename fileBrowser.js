/**
 * Created by zhannalibman on 31/01/2017.
 */
(function ($) {

    "use strict";

    $(document).ready(function () {
        navigationHistory.push(fileSystem.getRoot().id);
        updateUI();
        setupInitialEventHandlers();
    });

    /**
     * Creates folder tree display in the explorer panel,
     * displays folder or file in content panel and writes the path
     * according to current element in navigation history
     * */
    function updateUI() {
        showFolderOrFileContentById(navigationHistory.getCurrentId(), true);
        var treeState = getExplorerState();
        showFoldersTree(treeState);
    }

    /**
     * Sets some general event listeners.
     * */
    function setupInitialEventHandlers() {
        $('.layout').contextmenu(function () {
            return false;
        });
        $(window).click(hideContextMenu);
        $("#content").contextmenu(function (event) {
            showContextMenu(event);
            return false;
        });
        $("#path").on('keydown', function (event) {
            //if enter was pressed
            if (event.keyCode == 13) {
                var path = $(this).val();
                var element = fileSystem.findItemByPath(path);
                if (element != null) {
                    showFolderOrFileContentById(element.id);
                } else {
                    alert ("Path not found.");
                }
            }
        });
        $("#btnBack").click(back);
        $("#btnForward").click(forward);
    }

    /**
     * Navigates back in the history.
     * */
    function back() {
        if (!navigationHistory.hasBack()) {
            return;
        }
        if (!showFolderOrFileContentById(navigationHistory.back(), true)) {
            alert("Folder/file you want to open doesn't exist." +
                " The previous folder/file (if it exists) will be opened.");
            navigationHistory.deleteCurrentElementId(true/*goesBack*/);
            back();
        }
    }

    /**
     * Navigates forward in the history.
     * */
    function forward() {
        if (!navigationHistory.hasForward()) {
            return;
        }
        if (!showFolderOrFileContentById(navigationHistory.forward(), true)) {
            alert("Folder/file you want to open doesn't exist." +
                " The next folder/file (if it exists) will be opened.");
            navigationHistory.deleteCurrentElementId(false/*goesBack*/);
            forward();
        }
    }

    /**
     * Displays folder tree in the explorer.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    function showFoldersTree(collapsedElements) {
        var rootDomElement = $("#fs");
        rootDomElement.empty();
        showFoldersTreeRecursive(fileSystem.getRoot(), rootDomElement, collapsedElements)
    }

    /**
     * Actual implementation (recursive) of showFoldersTree
     * @param element - element in the fileStorage.
     * @param parentInDom - html element to which a new entry will be appended.
     * @param collapsedElements - the object that represents the previous state of the tree.
     * */
    function showFoldersTreeRecursive(element, parentInDOM, collapsedElements) {
        if (fileSystem.isFolder(element)) {
            var isCollapsed = collapsedElements == undefined || collapsedElements.hasOwnProperty(element.id);
            var ul = createFoldersListElement(element, parentInDOM, isCollapsed).find("ul");
            for (var i = 0; i < element.children.length; i++) {
                showFoldersTreeRecursive(element.children[i], ul, collapsedElements);
            }
        }
    }

    /**Creates single explorer tree object and attaches it to a parent object.
     * @param element - element in fsStorage.
     * @param parentInDOM - parent object to which the newly created object is attached
     * @param isCollapsed - the state of newly created object element.
     * @return the newly created object.
     * */
    function createFoldersListElement(element, parentInDOM, isCollapsed) {
        var elementInDom = $("<li><div class='image'/>" + " " +
            "<a href='#' data-id=" + element.id + ">" + element.name + "</a></li>");
        elementInDom.appendTo(parentInDOM);
        elementInDom.addClass("folder");
        if (isCollapsed && fileSystem.hasSubfolders(element)) {
            elementInDom.addClass("collapsed");
        }
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

    /**
     * Handles the click on the name of the folder in the explorer.
     * */
    function onFolderNameClick() {
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
    function onFolderIconClick() {
        const folderId = $(this).siblings('a').attr("data-id");
        if (fileSystem.hasSubfoldersById(folderId)) {
            $(this).parent().toggleClass("collapsed");
        }
    }

    /**
     * Display contents of folder in content panel
     * @param folderElement - folder to show in content panel
     */
    function displayFolderContent(folderElement) {
        var contentDiv = clearAndReturnContentDiv();
        var folderContent = fileSystem.sortFolderContent(folderElement.children);
        for (var i = 0; i < folderContent.length; i++) {
            var contentItem = $("<div data-id='" + folderContent[i].id + "'><div>" + folderContent[i].name + "</div></div>");
            contentItem.addClass("contentItem");
            contentItem.contextmenu(function (event) {
                showContextMenu(event);
                return false;
            });
            if (fileSystem.isFolder(folderContent[i])) {
                contentItem.attr("data-type", "folder");
                $("<img src='_images/folder.png'/>").prependTo(contentItem);
            } else {
                contentItem.attr("data-type", "file");
                $("<img src='_images/file.png'/>").prependTo(contentItem);
            }
            contentDiv.append(contentItem);
            contentItem.click(onContentItemClick);
        }
    }

    /**
     * Handles click on item in content panel
     */
    function onContentItemClick() {
        var elementId = $(this).attr("data-id");
        showFolderOrFileContentById(elementId);
    }

    /**
     * Displays file content in content panel
     * @param fileElement - file object from fsStorage
     * */
    function openFile(fileElement) {
        var displayFileTemplate = `<div class="fileDisplay">
                                    <textarea class="editFile" value="" autofocus/>
                                    <div class="editFileButtonsLayer">
                                        <button class="cancel">Cancel</button>
                                        <button class="save">Save</button>
                                    </div>
                                </div>`;
        var displayFile = $(displayFileTemplate);
        var contentDiv = clearAndReturnContentDiv();
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
        if (fileElement.content != undefined && fileElement.content != null) {
            displayFileTextArea.text(fileElement.content);
        }
    }

    /**
     * Handles save buton click in file editing. Saves changes to file content.
     */
    function saveChangesInFile() {
        var fileId = $(this).attr("data-id");
        var editedText = $("textarea.editFile").val();
        var fileAndParent = fileSystem.findElementAndParentById(fileId);
        var file = fileAndParent.element;
        file.content = editedText;
        var parent = fileAndParent.parent;
        if (parent != null) {
            showFolderOrFileContentById(parent.id);
        }
    }

    /**
     * Handles cancel buton click in file editing. Discards changes to file content.
     */
    function closeDisplayFile() {
        var fileId = $(this).attr("data-id");
        var parent = fileSystem.findParentByElementId(fileId);
        if (parent != null) {
            showFolderOrFileContentById(parent.id);
        }
    }

    /**
     * Helper function that clears content panel and returns it's div element
     * @return {*|HTMLElement}
     */
    function clearAndReturnContentDiv() {
        var contentDiv = $("#content");
        contentDiv.empty();
        return contentDiv;
    }

    /**
     * Shows context menu according to event
     * @param event - mouse click event
     */
    function showContextMenu(event) {
        var menuData = getMenuDataForTarget($(event.currentTarget));
        var menu = $(".menu");
        menu.empty();
        for (var i = 0; i < menuData.menuEntries.length; i++) {
            menu.append(menuData.menuEntries[i]);
        }
        menu.css('left', event.pageX + 'px');
        menu.css('top', event.pageY + 'px');
        menu.attr("data-id", menuData.id).show();
    }

    /**
     * Sets items of the context menu according to its target.
     * @param target - the element on which was the right click.
     * @return object with menu entries and the id of the element in the fileStorage to which the changes will be applied.
     * */
    function getMenuDataForTarget(target) {
        var newFolder = $("<div class='menuItem'>New folder</div>").click(createNewFolder);
        var newFile = $("<div class='menuItem'>New file</div>").click(createNewFile);
        var deleteFileOrFolder = $("<div class='menuItem'>Delete</div>").click(deleteElement);
        var rename = $("<div class='menuItem'>Rename</div>").click(renameElement);
        var menuEntries = [];
        var id;
        if (target.is("li")) {
            id = target.children('a').attr('data-id');
            menuEntries = [newFolder, rename];
            if (id > 0) {
                menuEntries.push(deleteFileOrFolder);
            }
        } else if (target.is("#content")) {
            // no right click in content when file is opened
            if ($(".fileDisplay").length !== 0) {
                return;
            }
            id = navigationHistory.getCurrentId();
            menuEntries = [newFolder, newFile];
        } else if (target.is(".contentItem")) {
            id = target.attr('data-id');
            var type = $(target).attr("data-type");
            if (type == "folder") {
                menuEntries = [newFolder, newFile];
            }
            menuEntries.push(deleteFileOrFolder);
            menuEntries.push(rename);
        }

        return {
            menuEntries: menuEntries,
            id: id
        }
    }

    /**
     * Hides context menu
     */
    function hideContextMenu() {
        $('.menu').hide();
    }

    /**
     * Handles rename element context menu entry
     */
    function renameElement() {
        var id = $(this).parent().attr("data-id");
        var item = fileSystem.findElementById(id);
        var editedItemName = prompt("Please enter the  new name", item.name);
        if (editedItemName == undefined) {
            return;
        }
        try {
            fileSystem.renameElement(id, editedItemName);
        } catch (err) {
            alert(err.message);
        }
        updateUI();
    }

    /**
     * Handles delete element context menu entry
     */
    function deleteElement() {
        var id = $(this).parent().attr("data-id");
        if (id == 0) {
            alert("Root can not be deleted.");
            return;
        }
        var userConfirmed = confirm("Are you sure?");
        if (userConfirmed) {
            fileSystem.deleteElement(id);
            if (id == navigationHistory.getCurrentId()) {
                navigationHistory.back();
            }
            updateUI();
        }
    }

    /**
     * Handles create new file context menu entry
     */
    function createNewFile() {
        var id = $(this).parent().attr("data-id");
        fileSystem.createFileOrFolder(id, "file");
        updateUI();
    }

    /**
     * Handles create new folder context menu entry
     */
    function createNewFolder() {
        var id = $(this).parent().attr("data-id");
        fileSystem.createFileOrFolder(id, "folder");
        updateUI();
    }

    /**
     * Returns object that represents current expand/collapse state of explorer tree
     */
    function getExplorerState() {
        var collapsed = $(".collapsed");
        if (collapsed.length == 0) {
            return undefined;
        }

        var ids = {};
        collapsed.each(function () {
            var id = $(this).children('a').attr("data-id");
            ids[id] = true;
        });
        return ids;
    }

    /**
     * Updates current path in UI
     * @param elementId
     */
    function displayPath(elementId) {
        var path = fileSystem.generatePathByElementId(elementId);
        var inputPath = $("#path");
        inputPath.val(path);
    }

    /**
     * Shows element in content panel, optionally adds it to history and updates path
     * @param elementId - element id
     * @param skipHistory - if true, does not add element to history.
     * @return {boolean} - returns true on success, false otherwise.
     */
    function showFolderOrFileContentById(elementId, skipHistory) {
        if (!skipHistory && navigationHistory.getCurrentId() == elementId) {
            return true;
        }
        var element = fileSystem.findElementById(elementId);
        if (element == null) {
            return false;
        }
        if (fileSystem.isFolder(element)) {
            displayFolderContent(element);
        } else {
            openFile(element);
        }
        if (!skipHistory) {
            navigationHistory.push(elementId);
        }
        displayPath(elementId);
        return true;
    }

})(jQuery);


