'use strict';

APP = APP || {};
APP.grid = (function (scope) {

    var _bindDOMEvents = function () {
        $('.density-level-1').click(function () {
            $('.table-col').css({
                padding: '10px 10px',
                fontSize: '14px'
            })
        });

        $('.density-level-2').click(function () {
            $('.table-col').css({
                padding: '13px 10px',
                fontSize: '15px'
            })
        })
    };

    // Getting data from db.json
    scope.getData = function () {
        var xhr = new XMLHttpRequest();
        const URL = 'data/db.json';
        xhr.open('GET', URL);
        xhr.onload = function () {
            var data = JSON.parse(xhr.responseText)
            scope.structreCreation(data)
        }
        xhr.send();
    };

    // Grid Structure Creation
    scope.structreCreation = function (data) {
        var productArr = data.products;
        productArr.map((curr, i, arr) => {
            var tableRowNode = `<div class="table-row">
                <span class="table-col" data-column="1">
                    <input type="checkbox" class="main-row-checkbox"/>
                </span>
                <span class="table-col" data-column="2">${i + 1}</span>
                <span class="table-col" data-column="3">${curr.name}</span>
                <span class="table-col" data-column="4">#${curr.code}</span>
                <span class="table-col" data-column="5">
                ${(curr.size).map((item) => {
                    return `<i>${item}</i>`
                })}
                </span>
                <span class="table-col price-col" data-column="6">${curr.price}</span>
                <span class="table-col product-color" data-column="7">
                ${(curr.color).map((item) => {
                    return `<i style=${`background-color:${item}`}></i>`
                }).join('')}
                </span>
                <span class="table-col" data-column="8">${curr.productCount} items</span>
                <span class="table-col remove-row" data-column="9" title="delete row">&#10008;</span>
           </div>`;
            $('#product-table .table-body').append(tableRowNode)
        })
    };

    // Column resizing from header cells
    scope.resizeCols = function () {
        var thElm;
        var startOffset;
        var colElems;
        Array.prototype.forEach.call(
            document.querySelectorAll(".trigger-resize"),
            function (th) {
                //th.style.position = 'relative';
                th.addEventListener('mousedown', function (e) {
                    thElm = th;
                    startOffset = th.parentNode.offsetWidth - e.pageX;
                    colElems = thElm.parentNode.getAttribute('data-column');
                });
            });

        document.addEventListener('mousemove', function (e) {
            if (thElm) {
                thElm.parentNode.style.width = startOffset + e.pageX + 'px';
                thElm.parentNode.style.maxWidth = startOffset + e.pageX + 'px';
                $(`span[data-column="${colElems}"]`).width(startOffset + e.pageX);
                $(`span[data-column="${colElems}"]`).css('max-width', startOffset + e.pageX);
            }
        });

        document.addEventListener('mouseup', function () {
            thElm = undefined;
        });

    };

    // Multi rows deletion and selection code
    scope.multiRowsOperation = function () {
        var checkboxesStatus = function () {
            var total = $('.main-row-checkbox').length;
            var checked = $('.main-row-checkbox:checked').length;

            // giving header checkbox a state (checked/intermediate)***\
            if (checked == 0) {
                $('#master-checkbox').prop('checked', false);
                $('#bulk-delete-rows').attr('disabled', true);
            }
            else if (total == checked) {
                $('#master-checkbox').prop('checked', true);
                $('#master-checkbox').prop('indeterminate', false);
            } else if (total > checked && checked > 0) {
                $('#master-checkbox').prop('indeterminate', true);
                $('#bulk-delete-rows').attr('disabled', false);
            } else {
                $('#master-checkbox').prop('checked', false);
                $('#master-checkbox').prop('indeterminate', false)
                $('#bulk-delete-rows').attr('disabled', true);
            }
        }

        $('#master-checkbox').on('click', function () {
            console.log(this.checked)
            $('.main-row-checkbox').prop('checked', this.checked);
            $('#bulk-delete-rows').attr('disabled', !(this.checked));
        });

        $('#product-table').on('change', '.main-row-checkbox', function () {
            checkboxesStatus()
        });

        $('#bulk-delete-rows').click(function () {
            var selectedRows = $('.main-row-checkbox:checked').parents('.table-row');
            $(selectedRows).remove();
            checkboxesStatus();
        });

    };

    // Delete single row
    scope.deleteRow = function () {
        // Delete Row
        $('#product-table').on('click', '.remove-row', function () {
            $(this).parent().remove();
        })
    }

    //Delete Column
    scope.deleteColumn = function () {
        // Delete Column
        $('.js-delete').on('click', function () {
            var clickedElem = $(this).parent().attr('data-column');
            $('[data-column="' + clickedElem + '"]').remove()
        })
    }

    // Sorting on click of Header Cells
    scope.sort = function () {
        var container = document.getElementsByClassName("table-body")[0];
        var mainElem = document.querySelectorAll('.js-sortable');
        var clickedElem;
        function insertBefore(el, referenceNode) {
            referenceNode.parentNode.insertBefore(el, referenceNode);
        }

        Array.prototype.forEach.call(mainElem, function (elem) {
            elem.addEventListener('click', function (event) {
                if (event.target.tagName == 'SPAN' || event.target.tagName == 'EM') {

                    var contents = container.querySelectorAll(".table-row");
                    var sortOrder = this.getAttribute('data-order');
                    clickedElem = this.getAttribute('data-column');


                    var elems = container.querySelectorAll('[data-column="' + clickedElem + '"]');
                    var list = [];
                    for (var i = 0; i < contents.length; i++) {
                        list.push(elems[i]);
                    }

                    list.sort(function (a, b) {
                        var reA = /[^a-zA-Z]/g;
                        var reN = /[^0-9]/g;
                        var aA = a.innerText.replace(reA, "");
                        var bA = b.innerText.replace(reA, "");
                        if (aA === bA) {
                            var aN = parseInt(a.innerText.replace(reN, ""), 10);
                            var bN = parseInt(b.innerText.replace(reN, ""), 10);
                            return aN === bN ? 0 : aN > bN ? 1 : -1;
                        } else {
                            return aA > bA ? 1 : -1;
                        }

                    });

                    //Removing class from head column
                    [].forEach.call(mainElem, function (el) {
                        el.classList.remove("asc-order");
                        el.classList.remove("dsc-order");
                    });
                    if (sortOrder == "asc") {
                        list.reverse();
                        this.setAttribute('data-order', 'dsc');

                        if (this.classList) {
                            this.classList.add("asc-order");
                            this.classList.remove("dsc-order");
                        };
                    }
                    if (sortOrder == "dsc") {
                        if (this.classList) {
                            this.classList.add("dsc-order");
                            this.classList.remove("asc-order");
                        };
                        this.setAttribute('data-order', 'asc')
                    }

                    for (var i = 0; i < list.length; i++) {
                        insertBefore(list[i].parentNode, container.firstChild);
                    }
                }
            })
        })
    }

    scope.init = function () {
        _bindDOMEvents();
        scope.resizeCols();
        scope.getData();
        scope.deleteColumn();
        scope.deleteRow();
        scope.multiRowsOperation();
        scope.sort()
    }

    return scope;


}(APP.grid || {}))





