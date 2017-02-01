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

$(document).ready(function () {
    var rootUl = $("#fs");
    printFS(fsStorage[0], rootUl);
});

function printFS(element, parentInDOM){
    var elementInDom = $("<li>" + element.name +  "</li>");
    elementInDom.addClass("element");
    elementInDom.appendTo(parentInDOM);
    if (element.children !== undefined){
        elementInDom.addClass("folder");
        var ul = $('<ul></ul>');
        ul.appendTo(elementInDom);
        for (var i = 0; i < element.children.length; i++){
            printFS(element.children[i], elementInDom);
        }
    }
    else{
        elementInDom.addClass("file");
    }

}