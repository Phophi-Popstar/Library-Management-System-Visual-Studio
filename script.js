(function(){
    // ---- data ----
    let books = [];

    // DOM refs
    const form = document.getElementById('mylibraryform');
    const userNameInput = document.getElementById("User-Name");
    const bookNameInput = document.getElementById("Book-Name");
    const radioButtons = document.querySelectorAll('input[name="check-box"]');
    const tbody = document.getElementById("table-body");
    const alertContainer = document.getElementById("alertuser");
    const bookCounter = document.getElementById("bookCounter");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

//helpers
function getSelectedGenre() {
    for(let rb of radioButtons){
        if(rb.checked) return rb.value;
    }
    return 'Fiction';
}

function formatDate(d){
  const dateObj = new Date(d);
  return dateObj.toLocaleDateString("en-IN", {day: "2-digit",  month: "short", year: "numeric",});
}

function showAlert(message, isError = false){
    alertContainer.innerHTML =`
    <div class="alert-custom ${isError ? 'alert-danger-custom' : ''}">
    <i class="${isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}"></i>
    <span>${message}</span>
    </div>
    `;
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 3200);
}

// render table
function renderTable(filter = ''){
    const filterLower = filter.toLowerCase().trim();
    let filteredBooks = books;
    if(filterLower !==''){
        filteredBooks = books.filter(book =>
            book.reader.toLowerCase().includes(filterLower) ||
            book.bookName.toLowerCase().includes(filterLower) ||
            book.genre.toLowerCase().includes(filterLower)
        );
    }

    if (filteredBooks.length === 0){
        tbody.innerHTML = `
        <tr class="empty-row">
        <td colspan="6">
        <i class="fas fa-book-open"></i>
        ${filterLower ? 'No results Found' : 'Library is empty. Add your First Book!'}
        </td>
        </tr>
        `;
    } else{
        tbody.innerHTML = filteredBooks.map((book, idx) =>{
            const globalIdx = books.indexOf(book);
            const isIssued = book.issued || false;
            return `
            <tr>
            <td><strong>${idx + 1}</strong></td>
            <td>${formatDate(book.date)}</td>
            <td><i class="fas fa-user-circle" style="margin-right: 6px; color: #6c7e94;"></i>${book.reader}</td>
            <td><i class="fas fa-book" style="margin-right: 8px; color: #b68b5c;"></i>${book.bookName}</td>
            <td><span class="book-genre">${book.genre}</span></td>
            <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end">
            ${isIssued ? `
                <button class="btn-icon return" data-id="${globalIdx}" title="Return book" type="button">
                <i class="fas fa-undo"></i> Return
                </button>
            ` : `
                <button class="btn-icon issue" data-id="${globalIdx}" title="Issue book" type="button">
                <i class="fas fa-hand-holding"></i> Issue
                </button>
            `}
            <button class="btn-icon delete" data-id="${globalIdx}" title="Delete book" type="button">
            <i class="fas fa-trash-alt"></i> Delete
            </button>
            </div>
            </td>
            </tr>
            `;
        }).join('');
    }

    //Update Counter
    bookCounter.textContent = books.length;
}

    //add Book
    function addBook(reader, bookName, genre){
        const newBook = {
            id: Date.now()+ Math.random(),
            reader: reader.trim(),
            bookName: bookName.trim(),
            genre: genre,
            date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            issued: false,
        };
        books.push(newBook);
        renderTable(searchInput.value.trim());
        showAlert(`📚 "${newBook.bookName}" added successfully!`);
    }

    //Delete Book
    function deleteBook(index){
        if(index >= 0 && index < books.length){
            const removed = books[index];
            books.splice(index,1);
            renderTable(searchInput.value.trim());
            showAlert(`🗑️ "${removed.bookName}" removed.`);
        } else {
            showAlert('Book not Found💔...', true);
        }
    }

    // issue Book
    function issueBook(index){
        if (index >= 0 && index < books.length) {
            const book = books[index];
            book.issued = true;
            renderTable(searchInput.value.trim());
            showAlert(`📖 "${book.bookName}" issued.`);
        } else{
            showAlert('❌Book not Found.', true);
        }
    }

    // return Book
    function returnBook(index){
        if (index >= 0 && index < books.length) {
            const book = books[index];
            book.issued = false;
            renderTable(searchInput.value.trim());
            showAlert(`📖 "${book.bookName}" returned.`);
        } else{
            showAlert('❌Book not Found.', true);
        }
    }

    //event delegation for actions
    function handleTableActions(e){
        const button = e.target.closest("button");
        if(!button) return;

        const dataId = button.getAttribute('data-id');
        if(dataId === null) return;

        const index = parseInt(dataId, 10);
        if(isNaN(index)) return;

        if(button.classList.contains('delete')){
            deleteBook(index);
        } else if(button.classList.contains('issue')){
            issueBook(index);
        } else if(button.classList.contains('return')){
            returnBook(index);
        }
    }

    // form submit
    function handleFormSubmit(e){
        e.preventDefault();
        const reader = userNameInput.value.trim();
        const bookName = bookNameInput.value.trim();
        if(!reader || !bookName){
            showAlert('⚠️Please fill in both Reader and Book Name.', true);
            return;
        }

        const genre = getSelectedGenre();
        addBook(reader, bookName, genre);
        //reset form
        userNameInput.value = '';
        bookNameInput.value = '';
        //reset radio to fiction
        document.querySelector('input[name="check-box"][value="Fiction"]').checked = true;
        userNameInput.focus();
    }

    //Search
    function performSearch(){
        const query = searchInput.value.trim();
        renderTable(query);
    }

    // -------------- init sample books --------------//
    function initSample(){
        const samples = [
            {reader: 'Sam', bookName: 'Jane Austen', genre:'Fiction'},
            {reader: 'Tumi', bookName: 'Clean Code', genre:'Programming'},
            {reader: 'Moses', bookName: 'The Story of Art', genre:'Art'},
        ];

        samples.forEach(s => {
            books.push({
                id: Date.now() + Math.random() * 1000,
                reader: s.reader,
                bookName: s.bookName,
                genre: s.genre,
                date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
                issued: false,
            });
        });
        renderTable('');
    }

    // ----- Attach events ------
    form.addEventListener('submit', handleFormSubmit);
    tbody.addEventListener('click', handleTableActions);

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) =>{
        if(e.key === 'Enter'){
            performSearch();
        }
    });

    // Realtime search while typing (optional)
    searchInput.addEventListener('input', () =>{
        // if you want to live search, uncomment:
        // performSearch();
    });

    // start
    initSample();

})();