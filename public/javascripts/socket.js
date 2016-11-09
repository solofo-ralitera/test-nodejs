// Oberserver for lazy render
let observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (el) {
        // Load image src (lazy render)
        if(el.target.tagName.toLowerCase() == "img") {
            let attr = el.target.getAttribute("data-src");
            if(attr && el.target.src == "") el.target.src = attr;
        }
        // Load next page on scroll
        else if(el.target.id == "scrollLoader") {
            if(el.intersectionRatio > 0) loadUsers();
        }
    });
}, {
    //root: document.querySelector('#scrollArea'),
    threshold: 1.0
});

window.onload = (function(prtLoad) {
    if(prtLoad) prtLoad();

    //addItems(!{JSON.stringify(users)});

    var socket = io();

    socket.on('newconnection', function(data) {
        //console.log("New user connected");
    });

    document.getElementById("contact").onkeydown = function(oKey) {
        if(oKey.keyCode == 13) {
            mTime1 = microtime(true);
            // use "user-addconcact-mysql" to add directly in mysql without worker queue
            socket.emit('user-worker-queue', {
                name: this.value
            });
        }
    };

    socket.on('user-addconcact-success', function(data) {
        updateMicroTime();
        document.getElementById("contact").value = "";
        addItem(data);
    });

    socket.on('user-addconcact-error', function(err) {
        updateMicroTime();
        console.error(err);
        highLightBody();
    });

    socket.on('user-removeconcact-success', function(data) {
        updateMicroTime();
        //document.getElementById("user_" + data.id).remove();
        let element = document.getElementById("user_" + data.id);
        element && element.parentNode && element.parentNode.removeChild(element);
    });

    socket.on('user-truncate-success', function(data) {
        updateMicroTime();
        document.getElementById("contactlist").innerHTML = "";
    });

    // Load next elements on scroll
    // #scrollLoader is placed at the end of the page, so if it is visible then load next page
    observer.observe(document.getElementById("scrollLoader"));

}).bind(null, window.onload);

let currentOffset = 0;
function loadUsers() {
    // return if no more page
    if(currentOffset < 0) return false;

    ajax("/socket/getuser?limit=100&page=" + currentOffset + "&_rand=" + Math.random(), {
        success : function(res) {
            if(res.readyState == 4) {
                let items = JSON.parse(res.responseText);
                if(items.items) {
                    currentOffset += items.items.length;
                    items.items.forEach(function(item) {
                        addItem(item);
                    });
                    // no more page
                    if(items.items.length == 0) {
                        currentOffset = -1;
                    }
                }
            }
        }
    });
}

let mTime1, mTime2;
function updateMicroTime() {
    mTime2 = microtime(true);
    document.getElementById("microtime").innerHTML = (mTime2 - mTime1) + "s";
}

const maxShowedItems = 10000;
let showedItems = 0;
function addItem(data) {
    if(showedItems > maxShowedItems) {
        document.getElementById("scrollLoader").innerHTML = "Max items number reached, stop loading.";
        return false;
    }
    let color = MaterialSoftColor[Math.floor(Math.random() * MaterialSoftColor.length)];
    let newItem = document.createElement("li");
    newItem.className = "contactlist-item"
    newItem.style.backgroundColor = color;
    newItem.id = "user_"+data.id;

    newItem.innerHTML = ""+
        "<span style='float:right;'><a href=\"javascript:removeItem("+data.id+")\" title='Delete'>x</a></span>" +
        "<div class='contactlist-item-name'>"+data.name+"</div>"+
        "<img class='loader contactlist-item-image' data-src=\"" + data.avatar + "\" />"+
        "<div class='contactlist-item-detail'>" +
        "<div>"+ data.job +"</div>" +
        "<div>"+ data.phone +"</div>" +
        "<div>"+ data.email.toLowerCase() +"</div>" +
        "</div>";
    document.getElementById("contactlist").appendChild(newItem);
    showedItems++;
    newItem.getElementsByTagName("img")[0].onerror = function() {
        observer.unobserve(this);
        this.style.visibility = "hidden";
    }
    // Add lazy rendering on the item
    observer.observe(newItem.getElementsByTagName("img")[0]);
}

function addItems(datas) {
    Object.keys(datas).forEach(function(key) {
        addItem(datas[key]);
    });
}

function removeItem(item) {
    //io().emit('user-removeconcact-mysql', {id: item});
    io().emit('user-removeconcact-queue', [item]);
}