const formCtrl = (function() {

    var userArr = [];

    fetch('./public/data/user.json')
        .then(res => res.json())
        .then(data => {
            document.getElementsByClassName('loading')[0].style.display = 'none';
            userArr = data;
            pagination(userArr);
        }).catch(err => console.log('http error:- ', err));

    var sort = 'asc';
    var searchName = '';
    var selectedRow = -1;
    var per_page = 6;
    var current_page = 1;
    var totalPages = Math.ceil(userArr.length / per_page);
    var edit_form = false;

    var mainTable = document.querySelector('.main-table');

    var modal = function() {
        var modal = document.querySelector('.main-modal');
        modal.style.display = 'block'
    }

    var closeModal = function() {
        if(edit_form) {
            document.querySelector('form').reset();
            document.getElementsByClassName('check')[selectedRow].checked = false;
            selectedRow = -1;
            edit_form =  false;
        }
        var modal = document.querySelector('.main-modal');
        modal.style.display = 'none'
    }

    var formSubmit = (event) => {
        event.preventDefault();
        const userObj = {};
        for (let i = 0; i < 3; i++) {
            let fieldName = event.target[i].labels[0].textContent;
            fieldName = fieldName.slice(0,1).toLowerCase() + fieldName.slice(1, fieldName.length);
            userObj[fieldName] = event.target[i].value;
        }
        if (!edit_form) {
            userArr.push(userObj);
            pagination(userArr);
        } else {
            document.getElementsByClassName('check')[selectedRow].checked = false;
            userArr[selectedRow] = userObj;
            const row = document.getElementsByClassName('check')[selectedRow];
            let element = row.parentElement.parentElement;
            element.getElementsByClassName('firstName')[0].textContent = userObj.firstName;
            element.getElementsByClassName('lastName')[0].textContent = userObj.lastName;
            element.getElementsByClassName('email')[0].textContent = userObj.email;
            selectedRow = -1;
            edit_form = false;
        }
        closeModal();
        document.querySelector('form').reset();
    }

    var editList = function() {
        if(selectedRow > -1) {
            edit_form = true;
            const row = document.getElementsByClassName('check')[selectedRow];
            let element = row.parentElement.parentElement;
            let fName = element.getElementsByClassName('firstName')[0].textContent;
            let lName = element.getElementsByClassName('lastName')[0].textContent;
            let email = element.getElementsByClassName('email')[0].textContent;

            modal();
            document.getElementById('exampleInputFirstname').value = fName;
            document.getElementById('exampleInputLastname').value = lName;
            document.getElementById('exampleInputEmail').value = email;
        }
    }

    var tableFun = function(data) {
        mainTable.style.display = 'block';
        let tableBody = document.querySelector('tbody');
        let tableData = '';
        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                tableData += generateTable(data[i], i+1);
            }
        } else {
            mainTable.style.display = 'none';
            document.getElementsByClassName('table-pagination')[0].style.display = 'none';
        }
        tableBody.innerHTML = tableData;
    };

    function generateTable(data, i=userArr.length) {
        const userObj = data;
        let rowData = '';
        for (let o in userObj) {
            if (o.toLowerCase() !== 'password') {
                rowData += `<td class="${o}">${userObj[o]}</td>`;
            }
        }
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        let checkbox = `<input type="checkbox" class="check" onchange="formCtrl.onChangeCheck(${i})" />`
        tr.appendChild(td);
        
        return `<tr><td>${checkbox}${rowData}</td></tr>`;
    }

    var changeCheck = function(val) {
        let check = document.getElementsByClassName('check');
        let j = check.length;
        console.log(val, check.length)

        for (let i = 0; i < check.length; i++) {
            if(sort === 'asc') {
                if (val !== i + 1) {
                    check[i].checked = false;
                } else {
                    selectedRow = val - 1;
                }
            } else {
                if (val !== j--) {
                    check[i].checked = false;
                } else {
                    selectedRow = val - 1;
                }
            }
        }
    }

    var pagination = function(data) {
        document.getElementsByClassName('table-pagination')[0].style.display = 'flex';
        current_page = 1;
        totalPages = Math.ceil(data.length / per_page);

        if (totalPages > 0) {
            let previous = `<li class="page-item"><a class="page-link previous disabled" onclick="formCtrl.pageSelect('previous')" href="#">Previous</a></li>`;
            let next = `<li class="page-item"><a class="page-link next" onclick="formCtrl.pageSelect('next')" href="#">Next</a></li>`;

            var pagination = document.getElementsByClassName('pagination')[0];

            let pageLinks = previous;

            tableFun(data.slice(0, per_page));
            for (let i = 0; i < totalPages; i++) {
                pageLinks += `<li class="page-item"><a class="page-link link${i + 1}" onclick="formCtrl.pageSelect(${i + 1})" href="#">${i + 1}</a></li>`
            }
            pageLinks += next;
            pagination.innerHTML = pageLinks
            pageSelect(current_page, data);
        } else {
            tableFun([]);
        }
    }

    function pageSelect(val, data = userArr) {
        if (isNaN(val)) {
            if (val === 'previous') {
                val = current_page - 1;
            }
            if (val === 'next') {
                val = current_page + 1;
            }
        }

        current_page = val;
        tableFun(data.slice(val * per_page - per_page, val * per_page));
        document.getElementsByClassName('next')[0].classList.remove('disabled');
        document.getElementsByClassName('previous')[0].classList.remove('disabled');
        if (val === totalPages) {
            document.getElementsByClassName('next')[0].classList.add('disabled');
        }

        if (val === 1) {
            document.getElementsByClassName('previous')[0].classList.add('disabled');
        }

        for (i = 0; i < totalPages; i++) {
            if (i + 1 !== val) {
                document.getElementsByClassName(`link${i + 1}`)[0].classList.remove('disabled');
            }
        }
        document.getElementsByClassName(`link${val}`)[0].classList.add('disabled');
    }

    var setName = function(event) {
        searchName = event.target.value;
        const searchObj = [];
        for(let i=0;i<userArr.length;i++) {
            let obj = userArr[i];
            for(let o in obj) {
                if(obj[o].toLowerCase().includes(searchName)) {
                    searchObj.push(obj);
                    break;
                }
            }
        }
        pagination(searchObj);
        searchName = '';
    }

    var deleteName = function () {
        if(selectedRow > -1) {
            console.log(selectedRow);
            const pos = per_page * (current_page - 1) + selectedRow;
            userArr.splice(pos, 1);
            console.log(pos, userArr);
            pagination(userArr);
            selectedRow = -1;
        }
    }

    // pagination(userArr);

    var changeRows = function() {
        var value = document.getElementById('exampleFormControlSelect1').value;
        per_page = +value;
        pagination(userArr);
    }

    var sortTable = function (name) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementsByClassName("table")[0];
        switching = true;
        dir = "asc";
        sort = dir;
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByClassName(name)[0];
                y = rows[i + 1].getElementsByClassName(name)[0];
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
            } else {
                if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    sort = dir;
                    switching = true;
                }
            }
        }
    }

    var images = [
        {src: './public/images/sample.jpg', alt: 'sample img'},
        {src: './public/images/butterfly.jpg', alt: 'sample img'},
        {src: './public/images/sample.jpg', alt: 'sample img'},
        {src: './public/images/butterfly.jpg', alt: 'sample img'}
    ]

    var carousel = () => {
        const carouselImg = document.querySelector('.carousel__img');
        var img = document.createElement('img');
        img.setAttribute('src', images[0].src);
        img.setAttribute('alt', images[0].alt);

        carouselImg.appendChild(img);

        const carouselItems = document.querySelector('.carousel__items');
        let items = ``;
        images.forEach((ele, index) => {
            if(index === 0) items += `<i class="fas fa-circle active" id="circle${index}" onclick="formCtrl.nextImage(${index})"></i>`;
            else {
                items += `<i class="fas fa-circle" id="circle${index}" onclick="formCtrl.nextImage(${index})"></i>`;
            }
        });

        carouselItems.innerHTML = items;
    }

    var autoScrollImage = (i) => {
        var index = i;
        document.querySelector('i.active').classList.remove('active');

        const item = document.getElementById(`circle${index}`);
        item.classList.add('active');
        const carouselImg = document.querySelector('.carousel__img');
        carouselImg.innerHTML = `<img src="${images[index].src}" alt="${images[index].alt}" />`;
    }

    carousel();
    var intervalNum;
    var imageInterval = (index) => {
        let i = index;
        intervalNum = setInterval(() => {
            let value = ++i;
            if(value === 3) {
                clearInterval(intervalNum);
                imageInterval(-1);
            }
            autoScrollImage(value);
        }, 3000);
    }

    imageInterval(0);

    var scrollImage = function(i) {
        var index = i;
        document.querySelector('i.active').classList.remove('active');

        const item = document.getElementById(`circle${index}`);
        item.classList.add('active');
        const carouselImg = document.querySelector('.carousel__img');
        carouselImg.innerHTML = `<img src="${images[index].src}" alt="${images[index].alt}" />`;
        clearInterval(intervalNum);
        imageInterval(index);
    }

    return {
        openModal: modal,
        closeModal: closeModal,
        onFormSubmit: formSubmit,
        delete: deleteName,
        getName: setName,
        onChangeCheck: changeCheck,
        pageSelect: pageSelect,
        onChangeRows: changeRows,
        edit: editList,
        sort: sortTable,
        nextImage: scrollImage
    }
})();