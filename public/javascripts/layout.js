const FlatDesignColor = [
    "#3498db",
    "#04a9c6",
    "#d216bc",
    "##d2a214",
    "#11d231",
    "#f1c40f",
    "#2ecc71",
    "#1abc9c",
    "#FF1744",
    "#FF4081",
    "#E040FB",
    "#B388FF",
    "#536DFE",
    "#82B1FF",
    "#00E5FF",
    "#00BFA5",
    "#69F0AE",
    "#B2FF59",
    "#C0CA33",
    "#F9A825",
    "#FFD600",
    "#FF9E80",
    "#6D4C41",
    "#78909C",
    "chocolate"
];

const MaterialSoftColor = [
    "#FFEBEE",
    "#FCE4EC",
    "#F3E5F5",
    "#EDE7F6",
    "#E8EAF6",
    "#E3F2FD",
    "#E1F5FE",
    "#E0F7FA",
    "#E0F2F1",
    "#E8F5E9",
    "#F1F8E9",
    "#F9FBE7",
    "#FFFDE7",
    "#FFF8E1",
    "#FFF3E0",
    "#FBE9E7",
    "#EFEBE9",
    "#FAFAFA",
    "#ECEFF1"
];

function ajax(url, param) {
    param = param || {};
    let method = (typeof param.method !== "undefined")? param.method : "GET";
    let success = (typeof param.success === "function")? param.success : function(){};

    let httpRequest = false;

    if (window.XMLHttpRequest) { // Mozilla, Safari,...
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            httpRequest.overrideMimeType('text/xml');
            // Voir la note ci-dessous à propos de cette ligne
        }
    }
    else if (window.ActiveXObject) { // IE
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
    }
    if (!httpRequest) {
        alert('Abandon :( Impossible de créer une instance XMLHTTP');
        return false;
    }
    httpRequest.onreadystatechange = function() { success(httpRequest); };
    httpRequest.open(method, url, true);
    httpRequest.send(null);
}

function LightenDarkenColor(col,amt) {
    let num = parseInt(col,16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    let newColor = g | (b << 8) | (r << 16);
    return newColor.toString(16);
}

function highLightBody() {
    document.body.className = "erroranimation";
    window.setTimeout(function(){
        document.body.className = "";
    }, 1000);
}

function setFlatMenuColor() {
    let colorList = FlatDesignColor.slice(0);
    Array.prototype.forEach.call(document.getElementsByClassName("flatbutton"), function (el) {
        if(colorList.length <= 0) {
            colorList = FlatDesignColor.slice(0);
        }
        let color = colorList[Math.floor(Math.random()*colorList.length)];
        el.style.backgroundColor = el.style.borderColor = color;
        colorList.splice(colorList.indexOf(color), 1);
    });
}

function createFlatMenu() {
    let str = document.getElementById("mainmenu").innerHTML
        .replace(/<li/g, "<div class='flatbutton'")
        .replace(/<\/li>/g, "</div>");
    let menus = document.getElementsByClassName("flatbuttoncontainer");
    Array.prototype.forEach.call(menus, function (el) {
        el.innerHTML = str;
    });

    setFlatMenuColor();
    setInterval(setFlatMenuColor, 10000);
}

function microtime (getAsFloat) {
    //  discuss at: http://locutus.io/php/microtime/
    // original by: Paulo Freitas
    // improved by: Dumitru Uzun (http://duzun.me)
    //   example 1: var $timeStamp = microtime(true)
    //   example 1: $timeStamp > 1000000000 && $timeStamp < 2000000000
    //   returns 1: true
    //   example 2: /^0\.[0-9]{1,6} [0-9]{10,10}$/.test(microtime())
    //   returns 2: true

    var s
    var now
    if (typeof performance !== 'undefined' && performance.now) {
        now = (performance.now() + performance.timing.navigationStart) / 1e3
        if (getAsFloat) {
            return now
        }

        // Math.round(now)
        s = now | 0

        return (Math.round((now - s) * 1e6) / 1e6) + ' ' + s
    } else {
        now = (Date.now ? Date.now() : new Date().getTime()) / 1e3
        if (getAsFloat) {
            return now
        }

        // Math.round(now)
        s = now | 0

        return (Math.round((now - s) * 1e3) / 1e3) + ' ' + s
    }
}

window.onload = (function(prtLoad) {
    if(prtLoad) prtLoad();

    createFlatMenu();

    document.getElementById("aggreg").onclick = function () {
        let dspl = document.getElementById("mainmenu").style.display;
        if(dspl == "none") {
            document.getElementById("mainmenu").style.display = "flex";
            document.getElementById("aggreg").style.backgroundColor = "#658db5";
            document.getElementById("aggreg").style.color = "white";
        }else {
            document.getElementById("mainmenu").style.display = "none";
            document.getElementById("aggreg").style.backgroundColor = "transparent";
            document.getElementById("aggreg").style.color = "#658db5";
        }

    };
}).bind(null, null);