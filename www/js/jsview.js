/*
Hi Developer, this is JavaScriptView

JavaScriptView is an open source project, you can use, modify and adapt it to your needs. Your help is important to improve it.

We want you in the team and collaborate with this little framework. You can email us at contact@javascriptview.com

Thanks!
*/

//Global vars

//var JSVFullSpinner, JSVStatusFullSpinner = false, JSVActualView, statusActionMenuSide = false, typeProject, tempDevice = 'iOS';
var JSVActualView, viewRemoveContent, statusActionMenuSide = false, typeProject, tempDevice = 'Android';

//This array save of each view
var JSVDeclareViews = new Array();

//This array save code html of each view ajax loaded
var JSVContainersViews = new Array();

//This array save code html of each item of list
var JSVItemsLists = new Array();

//This array save code html of each view ajax loaded
var JSVNotifications = new Array();
var objNotifications;

//Keep dom element body in a global variable
var objBody;

//Event onchange of select modal
var _JSViewEventOpenSelect = new Event('onchange');

$JSView = {
        
    run: function(type){
        //We get the type of device to change the height of the head in the case of iOS
        var style = document.createElement('style');
        style.type = 'text/css';
        //Photos style dinamic height
        style.innerHTML += '#search .actions { margin-left: ' + ((window.innerWidth/2)-86) + 'px }'; 
        style.innerHTML += '#search #searchMap #locateeme { margin-left: ' + ((window.innerWidth/2)-61) + 'px }'; 

        if(window.navigator.platform == 'MacIntel' || device.platform == 'iOS'){
            //style.innerHTML += 'jsv-content { top: 64px; } #search #searchMap { top: 64px; }';
            style.innerHTML += 'jsv-content { top: 64px; } #search #searchMap, #search jsv-content { top: 22px; } #search jsv-header{height:0px}';
            style.innerHTML += 'jsv-tabs{ top: 64px; }';
            style.innerHTML += '.has-tabs{ top: 109px; }';
            style.innerHTML += 'jsv-header { padding-top: 20px; height: 64px }';     
            style.innerHTML += '.notification { padding-top: 20px; height: 64px }';     
        }else{
            style.innerHTML += 'jsv-tabs{ top: 44px; }';
            style.innerHTML += '.has-tabs{ top: 89px; }';
            //style.innerHTML += '#search #searchMap { top: 44px; }';
            style.innerHTML += '#search #searchMap, #search jsv-content { top: 0px; } #search jsv-header{height:0px}';
            style.innerHTML += '.notification { height: 44px }';  
        }
        document.getElementsByTagName('head')[0].appendChild(style); 
        
        //Load FastClick
        new FastClick(document.body);
        //Save type proyect, now we can (null,left,bottom), this corresponds to the menu.
        typeProject = type;
        //Keep dom element body in a global variable
        objBody = $v.select('body');
        //Add full spinner div in dom        
        objBody.innerHTML += spinnerModal;
        objBody.innerHTML += '<div id="pushNotifications"></div>';
    },   
    //DECLARE, INIT, DATA AND GOTO VIEW
    declareView: function(e){
        //Read json of all views declared
        for(var obj in e){
            //Keep dom element in a variable
            var objElement = $v.select('#' + obj);
            //Create the container of all external views to jsv-main
            if(!objElement){
                //Add to body or container the element jsv-view of the view
                objBody.innerHTML += '<jsv-view id="' + obj + '"></jsv-view>';
                //Keep dom element in a variable
                objElement = $v.select('#' + obj);
                //Put all containers out of camera
                objElement.classList.add('JSVcontainerRight');
                objElement.classList.add('JSVcontainerTransition');
                //Save in the array the views declared with its options (url, template, controlator, ...)
                if(e.hasOwnProperty(obj)){
                    JSVDeclareViews[obj] = e[obj];
                }
                $JSVRequest.do(obj,e[obj].template);
            }
        }
    },
    initView: function(e){
        //Assign actual view to global var
        JSVActualView = e;
        //Keep dom element in a variable
        var objElement = $v.select('#' + e);
        //Put actual view into camera :)
        objElement.classList.remove('JSVcontainerRight');
        objElement.classList.add('JSVcontainerCenter');
        objElement.classList.remove('JSVcontainerBackground');
        objElement.classList.add('JSVcontainerForeground');
        //Read the template
        $JSVRequest.do(e,JSVDeclareViews[e].template,true);
        window.history.pushState(e, "Titulo", '/index.html#' + e);
    },
    actualView: function(){
        return JSVActualView;  
    },
    dataView: function(obj, e) {

        //console.group('dataView obj -> ' + obj);
        //console.time('dataView');
        
        var contentView = JSVContainersViews[e];
        for (var x in obj) {
            console.log(x);
            console.log(obj[x]);
            if(!obj[x]) obj[x]='';
            contentView = contentView.replace(new RegExp('{{'+x+'}}', 'g'), obj[x]);
        }
        //Keep dom element in a variable
        var objElement = $v.select('#' + e);
        //Remove the previous contents of the container
        objElement.innerHTML = ''
        //Add the new contents of the container
        objElement.innerHTML += contentView;
        
        //console.timeEnd('dataView');
        //console.groupEnd();
        
    },
    goToView: function(e){
        
        //console.group('goToView e -> ' + e);
        //console.time('goToView');
        
        //Keep dom element in a variable
        var objMain = $v.select('jsv-main');
        var objElement = $v.select('#' + e);
        //If the parent of this view YES is jsv-main, we move jsv-main to the left
        if($v.select('#' + JSVActualView).parentNode.tagName.toLowerCase() == 'jsv-container'){
            //Put the actual view out of camera
            objMain.classList.add('JSVcontainerLeft')
            objMain.classList.remove('JSVcontainerCenter')
            //Put the new view into the camera
            objElement.classList.add('JSVcontainerCenter')
            objElement.classList.remove('JSVcontainerRight')
        //If the parent of this view NO is jsv-main, we move this view to the left
        }else{
            //Keep dom element in a variable
            var objJSVActualView = $v.select('#' + JSVActualView);
            //Put the actual view out the camera
            objJSVActualView.classList.add('JSVcontainerLeft')
            objJSVActualView.classList.remove('JSVcontainerCenter')
            //Put the new view into the camera
            objElement.classList.add('JSVcontainerCenter')
            objElement.classList.remove('JSVcontainerRight')
        }
        
        //If the current view is different to the view query now
        if(JSVActualView != e){
            //Assign actual view to global var
            JSVActualView = e;
            //Execute the function controller of this view
            $JSView.controller[e](e);
            //Change the url
            window.history.pushState(e, '', '/index.html#' + e);
        }
        /*-----------*/
        
        //console.timeEnd('goToView');
        //console.groupEnd();
        
    },
    //DECLARE AND ACTION MENU
    declareMenu: function(e){
        //If we add the jsv-main component to body (This is why we want a menu)
        objBody.innerHTML += '<jsv-main></jsv-main>';
        //Keep dom element in a variable
        var objMain = $v.select('jsv-main');
        //Asign element jsv-main from body to objMain var
        objMain.innerHTML = '<jsv-container></jsv-container>';
        objMain.classList.add('JSVcontainerCenter');
        objMain.classList.add('JSVcontainerTransition');
        var objContainer = $v.select('jsv-container');
        objContainer.classList.add('jsv-main-' + typeProject);
        objContainer.classList.add('JSVcontainerCenter');
        objContainer.classList.add('JSVcontainerTransition');
        //Read json of all views declared
        for(var obj in e){
            if(obj == 'menu'){
                $v.select('jsv-main').innerHTML += '<jsv-menu-' + typeProject + ' id="' + obj + '"></jsv-menu-' + e[obj].type + '>';
                $JSVRequest.do(obj, e[obj].template, true);
            }else{
                //Add the container the jsv-vew element of the view
                $v.select('jsv-container').innerHTML += '<jsv-view id="' + obj + '"></jsv-view>';
                //Put all containers out the camera
                $v.select('#' + obj).classList.add('JSVcontainerBackground');
                //Save in array the views declarated with its options (url, template, controlator, ...)
                if(e.hasOwnProperty(obj)){
                    JSVDeclareViews[obj] = e[obj];
                }
                $JSVRequest.do(obj, e[obj].template);
            }
        }     
    },
    actionMenu: function(e){
        //Keep dom element in a variable
        var objContainer = $v.select('jsv-container');
        //If execute actionMenu with value in e, is that we want chante the intern view of jsv-main
        if (typeof e != 'undefined') {
            //Keep dom element in a variable
            var objElement = $v.select('#' + e);
            var objContainerJSVcontainerForeground = $v.select('jsv-container .JSVcontainerForeground')
            objContainerJSVcontainerForeground.classList.add('JSVcontainerBackground');
            objContainerJSVcontainerForeground.classList.remove('JSVcontainerForeground');
            objElement.classList.remove('JSVcontainerBackground');
            objElement.classList.add('JSVcontainerForeground');
            //If the current view is different to the view query now
            if(JSVActualView != e){
                //Assign actual view to global var
                JSVActualView = e;
                //Execute the function controller of this view
                $JSView.controller[e](e);
                //Change the url
                window.history.pushState(e, '', '/index.html#' + e);
            }
            /*-----------*/
        }
        //If is the left menu enter here
        if(typeProject == 'left'){
            if(statusActionMenuSide == false){
                objContainer.classList.add('JSVcontainerLeftMenuSide')
                objContainer.classList.remove('JSVcontainerCenter') 
                statusActionMenuSide = true
            }else{
                objContainer.classList.add('JSVcontainerCenter')
                objContainer.classList.remove('JSVcontainerLeftMenuSide')
                statusActionMenuSide = false
            }
        }
    },
    //DECLARE, OPEN AND CLOSE VIEW MODAL E-> VIEW
    declareModal: function(e,options){
        //Read json of all views modal declared
        for(var obj in e){
            //Keep dom element in a variable
            var objElement = $v.select('#' + obj);
            //Create the content of all external views to jsv-main
            if(!objElement){
                //Add to body or container the element jsv-view
                objBody.innerHTML += '<jsv-modal id="' + obj + '"></jsv-modal>';
                objElement = $v.select('#' + obj);
                //Put all containers out the camera
                objElement.classList.add('JSVcontainerBottom');
                objElement.classList.add('JSVcontainerTransition');
                //Save in array the views declarated with its options (url, template, controlator, ...)
                if(e.hasOwnProperty(obj)){
                    JSVDeclareViews[obj] = e[obj];
                }
                $JSVRequest.do(obj,e[obj].template);
            }
        }
    },
    openModal: function(e){
        //Keep dom element in a variable
        var objElement = $v.select('#' + e);
        //Change the class and show modal div
        objElement.classList.add('JSVcontainerCenter');
        objElement.classList.remove('JSVcontainerBottom');
        //Assign actual view to global var
        JSVActualView = e;
        //Execute the function controller of this view
        $JSView.controller[e](e);
        /*-----------*/
        //Change the url
        window.history.pushState(e, '', '/index.html#'+e);
    },
    closeModal: function(e){
        console.log('closeModal');
        //Test remove content view back
        viewRemoveContent = JSVActualView;
        //Keep dom element in a variable
        var objElement = $v.select('#' + e);
        //Change the class and hide modal
        objElement.classList.add('JSVcontainerBottom');
        objElement.classList.remove('JSVcontainerCenter');
        //Return to previous url
        window.history.back();
        setTimeout(function(){
            //Assign actual view to global var
            JSVActualView = window.history.state;
            setTimeout(function(){
                $v.select('#' + viewRemoveContent).innerHTML = '';
            },300);
        },30);
    },
    forceBack: function(){
        window.history.back();
        setTimeout(function(){
            //Assign actual view to global var
            JSVActualView = window.history.state;
        },30);
    },
    //OPEN AND CLOSE MODAL MENU BOTTOM, E-> VIEW, M-> ID MODAL
    openMenuModal: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        //Change the class and hide modal
        $v.select('#' + idPatrent + ' #' + e).classList.add('jsv-modal-menu-show');
        //Change the class and show modal div
        $v.select('#' + idPatrent + ' #' + e + ' jsv-list').classList.add('JSVcontainerCenter');
        //Close menu modal, click background transparent
        var liClicked = false
        $v.select('#' + idPatrent + ' #' + e + ' jsv-list ').onclick = function(){
            liClicked = true;
        } 
        $v.select('#' + idPatrent + ' #' + e).onclick = function(){
            if(liClicked == false){
                $JSView.closeMenuModal(e);
            }
            liClicked = false;
        }
    },
    closeMenuModal: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        //Change the class and hide modal
        $v.select('#' + idPatrent + ' #' + e).classList.remove('jsv-modal-menu-show');
        $v.select('#' + idPatrent + ' #' + e + ' jsv-list').classList.remove('JSVcontainerCenter');
    },
    
    /* ---------------- CUSTOM MODAL FORM ---------------- */
    //OPEN AND CLOSE MODAL FORM BOTTOM, E-> VIEW, M-> ID MODAL
    openFormModal: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        //Change the class and hide modal
        $v.select('#' + idPatrent + ' #' + e).classList.add('jsv-modal-form-show');
        //Change the class and show modal div
        $v.select('#' + idPatrent + ' #' + e + ' jsv-form').classList.add('JSVcontainerCenter');
        //Close menu modal, click background transparent
        var liClicked = false
        $v.select('#' + idPatrent + ' #' + e + ' jsv-form ').onclick = function(){
            liClicked = true;
        } 
        $v.select('#' + idPatrent + ' #' + e).onclick = function(){
            if(liClicked == false){
                $JSView.closeFormModal(e);
            }
            liClicked = false;
        }
    },
    closeFormModal: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        //Change the class and hide modal
        $v.select('#' + idPatrent + ' #' + e).classList.remove('jsv-modal-form-show');
        $v.select('#' + idPatrent + ' #' + e + ' jsv-form').classList.remove('JSVcontainerCenter');
    },
    /* ---------------- CUSTOM MODAL FORM ---------------- */
    
    //OPEN AND CLOSE MODAL MENU BOTTOM, E-> VIEW, M-> ID MODAL
    openSelect: function(e,obj){
        var idPatrent = $v.select('#' + e).parentNode.id;
        var objSelect = $v.select('#' + idPatrent + ' #' + e);
        var objSelectList = $v.select('#' + idPatrent + ' #' + e + ' jsv-list');
        var objSelectListUl = $v.select('#' + idPatrent + ' #' + e + ' jsv-list ul');
        var objSelectListUlLi = $v.selectAll('#' + idPatrent + ' #' + e + ' jsv-list ul li');
        //Change the class and hide modal
        objSelect.classList.add('jsv-select-show');
        //Change the class and show modal div
        objSelectList.classList.add('JSVcontainerCenter');
        //Close menu modal, click background transparent
        var liClicked = false;        
        //Create dinamic position with height dinamic
        var heightUl = objSelectListUl.offsetHeight;
        if(window.innerHeight > heightUl){
            objSelectList.style.top = ( ( window.innerHeight - heightUl ) / 2) + 'px';
            objSelectList.style.bottom = ( ( window.innerHeight - heightUl ) / 2) + 'px';
        }
        //Change option checked or no, different first time.
        var checked;
        for (var i = 0; i < objSelectListUlLi.length; i ++){
            if(objSelectListUlLi[i].hasAttribute('selected', 'selected')){
                   checked = objSelectListUlLi[i];
            }
            objSelectListUlLi[i].onclick = function(){
                //If any has been selected, remove her attribute
                if(checked != undefined){
                    checked.removeAttribute('selected');
                }
                //Set attribute selected obj pushed
                this.setAttribute('selected', 'selected');
                //Set attribute value of jsv-select with value of option pushed
                objSelect.setAttribute('value', this.getAttribute('value'));
                objSelect.dispatchEvent(_JSViewEventOpenSelect);
                //Change test button with text of option pushed
                obj.innerHTML = this.innerHTML;
            } 
        } 
        //If any option has been pushed set attribute selected first option.
        if(checked == undefined){
            objSelectListUlLi[0].setAttribute('selected', 'selected');
        }else if(checked != objSelectListUlLi[0]){
            objSelectListUlLi[0].removeAttribute('selected');
        }
        objSelect.onclick = function(){
            if(liClicked == false){
                $JSView.closeSelect(e);
            }
            liClicked = false;
        }
    },
    resetSelect: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        var objSelectListUlLi = $v.selectAll('#' + idPatrent + ' #' + e + ' jsv-list ul li');
        for (var i = 0; i < objSelectListUlLi.length; i ++){
            objSelectListUlLi[i].removeAttribute('selected');
        } 
    },
    closeSelect: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        //Change the class and hide modal
        $v.select('#' + idPatrent + ' #' + e).classList.remove('jsv-select-show');
        $v.select('#' + idPatrent + ' #' + e + ' jsv-list').classList.remove('JSVcontainerCenter');
    },
    //SHOW NOTIFICATIONS T->text
    showNotification: function(t){
        var modalId = Date.now();
        $v.select('#pushNotifications').innerHTML += '<div id="notification' + modalId + '" class="notification JSVcontainerTop JSVcontainerTransition">' + t + '</div>';
        //objNotifications.innerHTML += '<div id="notification' + modalId + '" class="notification JSVcontainerTop JSVcontainerTransition">' + t + '</div>';
        //Put element notification in camera
        JSVNotifications[modalId] = setTimeout(function(){
            $v.select('#notification' + modalId).classList.add('JSVcontainerCenter');
            $v.select('#notification' + modalId).classList.remove('JSVcontainerTop');
            //Put element notification out camera and remove element
            setTimeout(function(){
                $v.select('#notification' + modalId).classList.add('JSVcontainerTop');
                $v.select('#notification' + modalId).classList.remove('JSVcontainerCenter');
                setTimeout(function(){
                    $v.select('#notification' + modalId).remove();
                    clearInterval(JSVNotifications[modalId]);
                    delete JSVNotifications[modalId];
                },250);
            },4000);
        },100);
    },
    //ANIMATION SCROLL TO
    scrollToAnimate: function(element, target, duration) {
        target = Math.round(target);
        duration = Math.round(duration);
        if (duration < 0) {
            return Promise.reject("bad duration");
        }
        if (duration === 0) {
            element.scrollTop = target;
            return Promise.resolve();
        }

        var start_time = Date.now();
        var end_time = start_time + duration;

        var start_top = element.scrollTop;
        var distance = target - start_top;

        // based on http://en.wikipedia.org/wiki/Smoothstep
        var smooth_step = function(start, end, point) {
            if(point <= start) { return 0; }
            if(point >= end) { return 1; }
            var x = (point - start) / (end - start); // interpolation
            return x*x*(3 - 2*x);
        }

        return new Promise(function(resolve, reject) {
            // This is to keep track of where the element's scrollTop is
            // supposed to be, based on what we're doing
            var previous_top = element.scrollTop;

            // This is like a think function from a game loop
            var scroll_frame = function() {
                if(element.scrollTop != previous_top) {
                    reject("interrupted");
                    return;
                }

                // set the scrollTop for this frame
                var now = Date.now();
                var point = smooth_step(start_time, end_time, now);
                var frameTop = Math.round(start_top + (distance * point));
                element.scrollTop = frameTop;

                // check if we're done!
                if(now >= end_time) {
                    resolve();
                    return;
                }

                // If we were supposed to scroll but didn't, then we
                // probably hit the limit, so consider it done; not
                // interrupted.
                if(element.scrollTop === previous_top
                    && element.scrollTop !== frameTop) {
                    resolve();
                    return;
                }
                previous_top = element.scrollTop;

                // schedule next frame for execution
                setTimeout(scroll_frame, 0);
            }

            // boostrap the animation process
            setTimeout(scroll_frame, 0);
        });
    },
    //INIT PLACEHOLDER FORM
    initFormPlaceholder: function(e,form){
        //Keep dom element in a variable
        var objInputs = $v.selectAll('#' + e + ' #' + form + ' input');
        var objTextareas = $v.selectAll('#' + e + ' #' + form + ' textarea');
        //Read all severals elements type inputs from form
        for(var i = 0; i < objInputs.length; i++){
            objInputs[i].onkeyup = function(e){
                if(this.value != '')
                    this.parentElement.childNodes[0].classList.add('show');
                else
                    this.parentElement.childNodes[0].classList.remove('show');
            }
        }
        for(var i = 0; i < objTextareas.length; i++){
            objTextareas[i].onkeyup = function(e){
                if(this.value != '')
                    this.parentElement.childNodes[0].classList.add('show');
                else
                    this.parentElement.childNodes[0].classList.remove('show');
            }
        }
    },
    //INIT MENU CIRCLE
    initMenuCircle: function(e){
        //Keep dom element in a variable
        var objElement = $v.select('#' + e + ' jsv-menu-circle');
        
        var objElementUl = $v.select('#' + e + ' jsv-menu-circle jsv-list ul');
        //Added a style element for animation. It is obligatory for the animation is fluid
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML += '#' + objElement.id + '.JSVmenuCircleOpen { height: ' + (objElementUl.offsetHeight-70) + 'px; }';
        document.getElementsByTagName('head')[0].appendChild(style);
        //If the user click in ul don´t hide menu, but if click in element parent yes.
        var liClicked = false
        objElementUl.onclick = function(){
            liClicked = true;
        } 
        objElement.onclick = function(){
            if(liClicked == false){
                if(objElement.classList.contains('JSVmenuCircleOpen') == false){
                    //Change the class and hide modal
                    objElement.classList.add('JSVcontainerCenter');
                    objElement.classList.add('JSVmenuCircleOpen');
                }else{
                    //Change the class and hide modal
                    objElement.classList.remove('JSVmenuCircleOpen');
                    objElement.classList.remove('JSVcontainerCenter');
                }
            }
            liClicked = false;
        }
    },
    closeMenuCircle: function(e){
        var idPatrent = $v.select('#' + e).parentNode.id;
        var objElement = $v.select('#' + idPatrent + ' jsv-menu-circle#' + e);
        //Change the class and close menu
        objElement.classList.remove('JSVmenuCircleOpen');
        objElement.classList.remove('JSVcontainerCenter');
    },
	//OPEN CLOSE IMAGE POPUP
    openImage: function(image,e){
        var objElement = $v.select('jsv-image-popup#' + e);
		objElement.style.backgroundImage = image.style.backgroundImage;
        objElement.classList.add('show');
    },
    closeImage: function(e){
        var objElement = $v.select('jsv-image-popup#' + e);
        objElement.classList.remove('show');
        setTimeout(function(){
            objElement.style.backgroundImage = '';
        },250);
    },
    //ANIMATE
    animate: function(obj,e){
        
        var JSVItemsAnimate = new Array();
        var JSVItemsAnimateInitPosition = new Array();
        var JSVItemsAnimateSetTimeout = new Array();
        
        //for(i in obj){
        for(var i = 0; i < obj.length; i ++){
            
            
            console.log(i); 
            console.log(obj[i]);
            console.log(obj[i].element);
            
            JSVItemsAnimate[i] = $v.select('#' + e + ' #' + obj[i].element);
            
            if(obj[i].speed != undefined){
                JSVItemsAnimate[i].style.transition.delay = obj[i].speed + "ms";
            }
            
            if(JSVItemsAnimate[i].style.transform == ''){
                var x = JSVItemsAnimate[i].style.top + 'px';
                if(x == '') x = '0px';
                var y = JSVItemsAnimate[i].style.left + 'px';
                if(y == '') y = '0px';
                JSVItemsAnimate[i].style.transform = 'translate3d(' + x + ',' + y + ',0)';
            }
            
            JSVItemsAnimateInitPosition[i] = JSVItemsAnimate[i].style.transform;
            
            JSVItemsAnimate[i].classList.add(obj[i].effect);
            JSVItemsAnimate[i].style.position = 'absolute'; 
               
            if(obj[i].position.from != 'actual'){
                
                var from = obj[i].position.from.split(",");
                
                if(from.length == 2){
                    JSVItemsAnimate[i].style.transform = 'translate(' + obj[i].position.from + ')';
                }else if(from.length == 3){
                    JSVItemsAnimate[i].style.transform = 'translate3d(' + obj[i].position.from + ')';
                }else{
                    console.error('Data FROM isn´t correct');
                }
                
            }else{
                JSVItemsAnimate[i].style.transform = JSVItemsAnimate[i].style.transform;
            }
            
            if(obj[i].opacity != undefined && obj[i].opacity.from != undefined){
                JSVItemsAnimate[i].style.opacity = obj[i].opacity.from; 
            }
            
            $JSView.animateDelay(JSVItemsAnimate, i, obj, JSVItemsAnimateInitPosition);
        }
        
        console.log(JSVItemsAnimate);
        
    },
    animateDelay(JSVItemsAnimate, i, obj){
        
        setTimeout(function(){
                
            console.log(obj);
            console.log(i);

            if(obj[i].speed != undefined){
                JSVItemsAnimate[i].style.transition.delay = obj[i].speed + "ms";
            }
            
            if(obj[i].position.to != 'actual'){

                var to = obj[i].position.to.split(",");

                if(to.length == 2){
                    JSVItemsAnimate[i].style.transform = 'translate(' + obj[i].position.to + ')';
                }else if(to.length == 3){
                    JSVItemsAnimate[i].style.transform = 'translate3d(' + obj[i].position.to + ')';
                }else{
                    console.error('Data TO isn´t correct');
                }

            }else{
                JSVItemsAnimate[i].style.transform = JSVItemsAnimateInitPosition[i];   
            }
            
            if(obj[i].opacity != undefined && obj[i].opacity.to != undefined){
                JSVItemsAnimate[i].style.opacity = obj[i].opacity.to; 
            }

        },obj[i].delay);
        
    },
    //ACTION BACK BUTTON
    back: function(){
        console.log('back');
        //Test remove content view back
        viewRemoveContent = JSVActualView;
        //Return to previous url
        window.history.back();
        setTimeout(function(){
            console.log(window.history.state);
            $JSView.returnTo(window.history.state);
            setTimeout(function(){
                $v.select('#' + viewRemoveContent).innerHTML = '';
            },300);
        },30);
    },
    onBackKeyDown: function(){
        console.log('onBackKeyDown');   
        $JSView.back();
    }, 
    returnTo: function(e){
        //Keep dom element in a variable
        var objElementJSVActualView = $v.select('#' + JSVActualView);
        //If parent of view YES is jsv-main, move to center jsv-main
        if($v.select('#' + e).parentNode.tagName.toLowerCase() == 'jsv-container'){
            //Keep dom element in a variable
            var objMain = $v.select('jsv-main');
            //Put all containers out the camera
            objElementJSVActualView.classList.add('JSVcontainerRight')
            objElementJSVActualView.classList.remove('JSVcontainerCenter')
            //Put the new view into camera
            objMain.classList.add('JSVcontainerCenter')
            objMain.classList.remove('JSVcontainerLeft')
        //If parent of view is NOT jsv-main, move to center the view
        }else{
            //Keep dom element in a variable
            var objElement = $v.select('#' + e);
            //Put all containers out the camera
            objElementJSVActualView.classList.add('JSVcontainerRight')
            objElementJSVActualView.classList.remove('JSVcontainerCenter')
            //Put the new view into camera
            objElement.classList.add('JSVcontainerCenter')
            objElement.classList.remove('JSVcontainerLeft')
        }
        //Assign actual view to global var
        JSVActualView = e
    },
    //This function read all 'a' element and create event onclick to open inappbrowser plugin cordova
    parseAllLink: function(e){
        $v('a').each(function() {
            $v( this ).attr( "onclick", "window.open('"+$v( this ).attr("href")+"', '_blank', 'location=yes')");
            $v( this ).removeAttr("href");
        }); 
    },
    //This function open alert native plugin cordova
    openDialog: function(message,title,button){
        navigator.notification.alert(
            message, // message
            null,    // callback
            title,   // title
            button   // buttonName
        );
    },
    //This function create slides
    initSlide: function(e, options){
        var elements = $v.selectAll(e + ' .JSVscroller ul li');
        var numberElement;
        var maxWidth;
        //Asign width
        if(options.responsive == true){
            //Responsive
            numberElement = elements.length;
            maxWidth = $v.select(e).parentElement.offsetWidth;
            maxHeight = $v.select(e).parentElement.offsetHeight;
            var divs = $v.selectAll(e + ' .JSVscroller ul li');
            for (var i = 0; i < numberElement; ++i) {
                $v.selectAll(e + ' .JSVscroller ul li')[i].style.width = maxWidth + 'px';
                $v.selectAll(e + ' .JSVscroller ul li')[i].style.height = maxHeight + 'px';
            }
            $v.select(e + ' .JSVscroller').style.width = (maxWidth * numberElement) + 'px';
        }else if(options.width && options.height){
            //Absolute
            $v.select(e).style.width = options.width + 'px';
            $v.select(e).style.height = options.height + 'px' ;
            numberElement = elements.length;
            maxWidth = options.width;
            for (var i = 0; i < numberElement; ++i) {
                $v.selectAll(e + ' .JSVscroller ul li')[i].style.width = maxWidth + 'px';
            }
            $v.select(e + ' .JSVscroller').style.width = (maxWidth * numberElement) + 'px';
        }else{
            console.warn("Debes definir un diseño responsive o absoluto con width y eight.")   
        }
        /*---------------------*/

        //Create the indicators
        if(options.indicators == true){
            $v.select(e).innerHTML += '<div class="JVSnav"><ul class="JSVindicator"></ul></div>';
            var indicator = '';
            for (var i = 1; i <= numberElement; i++){
                if ( i == 1) indicator += '<li class="active">' + i + '</li>';
                else indicator += '<li>' + i + '</li>';
            }
            $v.select(e + ' .JSVindicator').innerHTML = indicator;
            $v.select(e + ' .JSVindicator').style.paddingLeft = (maxWidth - this.innerWidth) + 'px';
        }
        /*---------------------*/

        //Add slide to array
        new iScroll(e, {
            snap: true,
            momentum: false,
            hScrollbar: false,
            onScrollEnd: function () {
                if(options.indicators == true){
                    $v.select(e + ' .JSVindicator > li.active').className = '';
                    $v.select(e + ' .JSVindicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
                }
                if(e == '#intentSlideNoRegister'){
                    console.log('intentSlideNoRegister' + this.currPageX);
                    if(this.currPageX == 2){
                        $v.select('#slideNoRegister button-header-left').classList.remove('hide');
                    }else{
                        if(!$v.select('#slideNoRegister button-header-left').classList.contains('hide')){
                            $v.select('#slideNoRegister button-header-left').classList.add('hide');  
                        }
                    }
                }
            }
         });
         /*---------------------*/
    },
    //This function create slides ADVERTISING
    initSlideAdvertising: function(e, options){
        var elements = $v.selectAll(e + ' .JSVscrollerAd ul li');
        var numberElement;
        var maxWidth;
        //Asign width
        if(options.responsive == true){
            //Responsive
            numberElement = elements.length;
            maxWidth = $v.select(e).parentElement.offsetWidth;
            maxHeight = $v.select(e).parentElement.offsetHeight;
            var divs = $v.selectAll(e + ' .JSVscrollerAd ul li');
            for (var i = 0; i < numberElement; ++i) {
                $v.selectAll(e + ' .JSVscrollerAd ul li')[i].style.width = maxWidth + 'px';
                $v.selectAll(e + ' .JSVscrollerAd ul li')[i].style.height = maxHeight + 'px';
            }
            $v.select(e + ' .JSVscrollerAd').style.width = (maxWidth * numberElement) + 'px';
        }else if(options.width && options.height){            
            //Absolute
            $v.select(e).style.width = options.width + 'px';
            $v.select(e).style.height = options.height + 'px' ;
            numberElement = elements.length;
            maxWidth = options.width;
            maxHeight = options.height;
            for (var i = 0; i < numberElement; ++i) {
                $v.selectAll(e + ' .JSVscrollerAd ul li')[i].style.width = (maxWidth-60) + 'px';
                $v.selectAll(e + ' .JSVscrollerAd ul li')[i].style.height = maxHeight + 'px';
            }
            $v.select(e + ' .JSVscrollerAd').style.width = ((maxWidth-40) * numberElement)-20 + 'px';
        }else{
            console.warn("Debes definir un diseño responsive o absoluto con width y eight.")   
        }
        /*---------------------*/

        //Add slide to array
        new iScroll(e, {
            snap: true,
            momentum: false,
            hScrollbar: false,
            advertising: true,
            onScrollStart: function () {
                console.log(this.currPageX+1)
            }
         });
         /*---------------------*/
    },
    //This function start the tabs
    initTabs: function(e, options){
        for (var i = 0; i < $v.selectAll('jsv-tabs jsv-tab').length; ++i) {
            $v.selectAll('jsv-tabs jsv-tab')[i].addEventListener('click', function() { 
                
                //Active the tab touched
                $v.select('#' + e + ' jsv-tabs > jsv-tab.active').classList.remove('active');
                this.classList.add('active');
                
                //Active jsv-content of asigned jsv-tab
                litems=this.parentNode.getElementsByTagName('jsv-tab') 
                for (i=0;i<litems.length;i++){ 
                    if (litems.item(i)==this){ 
                        $v.select('#' + e + ' jsv-content > jsv-tab.active').classList.remove('active');
                        $v.selectAll('#' + e + ' jsv-content > jsv-tab')[i].classList.add('active');
                    } 
                }
            
            }, false);  
        }
    },
    //This function start the tabs
    initTabsProfile: function(e, options){
        for (var i = 0; i < $v.selectAll('jsv-tabs jsv-tab').length; ++i) {
            $v.selectAll('jsv-tabs jsv-tab')[i].addEventListener('click', function() { 
                
                //Active the tab touched
                $v.select('#' + e + ' jsv-tabs > jsv-tab.active').classList.remove('active');
                this.classList.add('active');
                
                //Active jsv-content of asigned jsv-tab
                litems=this.parentNode.getElementsByTagName('jsv-tab') 
                for (i=0;i<litems.length;i++){ 
                    if (litems.item(i)==this){ 
                        $v.select('#' + e + ' jsv-content > jsv-tab.active').classList.remove('active');
                        $v.selectAll('#' + e + ' jsv-content > jsv-tab')[i].classList.add('active');
                    } 
                }
            
            }, false);  
        }
    },
    //This function query urls externals with several parameters
    query: function(type, url, header, data){
        // Return a new promise.
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open(type, url);
            req.onload = function() {
                if (req.status == 200 || req.status == 0) {
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = function() {
                reject(Error("Network Error"));
            };
            req.send();
        }); 
    },
    newContent: function (obj, e){
        $v.select('#' + e + ' jsv-content jsv-list').insertAdjacentHTML('beforebegin', '<jsv-newcontent class="JSVcontainerTransition"><div>' + obj.text + '</div></jsv-newcontent>');
        setTimeout(function(){
            $v.select('#' + e + ' jsv-content jsv-newcontent').classList.add('jsv-newcontent-show');
            $v.select('#' + e + ' jsv-content jsv-newcontent').onclick = function(){
                console.log('click');
                $v.select('#' + e + ' jsv-content jsv-newcontent').classList.remove('jsv-newcontent-show');
                $v.select('#' + e + ' jsv-content').scrollTop = 0;
            }
            
        },500);
    },
    //This function add refresh and loadmore function to scroll view
    initScroll: function (obj, e){
        //THIS FUNCTION IS NOW IN TEST
        //obj -> type, url, header, data, increase, refresh, loadmore
        //Now only can use "type" and "url"
        
        //console.group('initLoad');
        //console.time('initLoad');

        var list = $v.select('#' + e + ' jsv-content jsv-list');
        
        if(JSVItemsLists[e] == undefined){
            JSVItemsLists[e] = list.innerHTML;
            list.innerHTML = '';
        }
                
        var contentView;
        
        if(obj.type == undefined && obj.url == undefined ){
            
            if (typeof obj.isArray === 'undefined') {
                //Code depending on result
                console.log(obj);
                    
                //console.group('query');
                //console.time('query');
                contentView = '';
                var resultQuery = obj;
                
                for (key in resultQuery) {
                    itemInter = JSVItemsLists[e];
                    for (var x in resultQuery[key]) {
                        if(!resultQuery[key][x]) resultQuery[key][x]='';
                        itemInter = itemInter.replace(new RegExp('{{'+x+'}}', 'g'), resultQuery[key][x]);
                    }
                    contentView += itemInter;
                }

                //Add the new contents of the container
                list.innerHTML += contentView;

                //console.timeEnd('query');
                //console.groupEnd();

            }
            
        }
        
        if(obj.type != undefined && obj.url != undefined ){
            //Load init data from external service
            $JSView.query(obj.type, obj.url).then(function(result) {
                //Code depending on result
                console.log(JSON.parse(result));

                //console.group('query');
                //console.time('query');
                contentView = '';
                var resultQuery = JSON.parse(result);
                for (key in resultQuery) {
                    itemInter = JSVItemsLists[e];
                    for (var x in resultQuery[key]) {
                        if(!resultQuery[key][x]) resultQuery[key][x]='';
                        itemInter = itemInter.replace(new RegExp('{{'+x+'}}', 'g'), resultQuery[key][x]);
                    }
                    contentView += itemInter;
                }

                //Add the new contents of the container
                list.innerHTML += contentView;

                //console.timeEnd('query');
                //console.groupEnd();

            }).catch(function() {
                //An error occurred
                console.log('An error occurred');
            });
        }

        if(obj.refresh == true){
            
            $v.select('#' + e + ' jsv-content').style.top = '24px';
            var starty = 0;
            var actionReload = false;
            
            //Add spinner
            $v.select('#' + e + ' jsv-content jsv-refresh').innerHTML = spinner;
            
            $v.select('#' + e + ' jsv-content').addEventListener('touchstart', function(element){
                if(actionReload == false) starty = element.changedTouches[0].pageY;
            }, false)

            $v.select('#' + e + ' jsv-content').addEventListener('touchmove', function(element){

                if($v.select('#' + e + ' jsv-content').scrollTop == 0 && element.changedTouches[0].pageY > starty){
                    $v.select('#' + e + ' jsv-content').style.webkitTransform  = 'translate3d(0px,' + (element.changedTouches[0].pageY - starty) + 'px,0px)';
                    $v.select('#' + e + ' jsv-content').style.transform  = 'translate3d(0px,' + (element.changedTouches[0].pageY - starty) + 'px,0px)';
                    actionReload = true;
                }
                
            }, false)

            $v.select('#' + e + ' jsv-content').addEventListener('touchend', function(element){

                //If actionReload is true and scroll positionY is more than 44px
                if(actionReload == true && element.changedTouches[0].pageY > (starty+44)){

                    $v.select('#' + e + ' jsv-content').classList.add('JSVcontainerTransition');

                    $v.select('#' + e + ' jsv-content').style.webkitTransform = 'translate3d(0px,44px,0px)';
                    $v.select('#' + e + ' jsv-content').style.transform  = 'translate3d(0px,44px,0px)';
        
                    $JSView.query(obj.type, obj.url).then(function(result) {
                        //Code depending on result
                        console.log(JSON.parse(result));

                        //console.group('query');
                        //console.time('query');
                        contentView = '';
                        var resultQuery = JSON.parse(result);
                        for (key in resultQuery) {
                            itemInter = item;
                            for (var x in resultQuery[key]) {
                                if(!resultQuery[key][x]) resultQuery[key][x]='';
                                itemInter = itemInter.replace(new RegExp('{{'+x+'}}', 'g'), resultQuery[key][x]);
                            }
                            contentView += itemInter;
                        }

                        //Add the new contents of the container
                        $v.select('#' + e + ' jsv-content jsv-list').innerHTML = contentView;

                        //Return to init position
                        $v.select('#' + e + ' jsv-content').style.webkitTransform = 'translate3d(0px,0px,0px)';
                        $v.select('#' + e + ' jsv-content').style.transform  = 'translate3d(0px,0px,0px)';
                        //$v.select('#' + e + ' jsv-content').style.transform  = 'initial';
                        setTimeout(function(){
                            $v.select('#' + e + ' jsv-content').classList.remove('JSVcontainerTransition');
                            actionReload = false;
                        },250)

                        //console.timeEnd('query');
                        //console.timeEnd();

                    }).catch(function() {
                        // an error occurred
                        console.log('An error occurred');
                    });  
                    
                //If actionReload is false and scroll positionY is less than 44px
                }else{
                    
                    $v.select('#' + e + ' jsv-content').classList.add('JSVcontainerTransition');
                    
                    //Return to init position
                    $v.select('#' + e + ' jsv-content').style.webkitTransform = 'translate3d(0px,0px,0px)';
                    $v.select('#' + e + ' jsv-content').style.transform  = 'translate3d(0px,0px,0px)';
                    //$v.select('#' + e + ' jsv-content').style.transform  = 'initial';
                    setTimeout(function(){
                        $v.select('#' + e + ' jsv-content').classList.remove('JSVcontainerTransition');
                        actionReload = false;
                    },250)
                }   

            }, false)
            
        }

        if(obj.loadmore == true){ 
            //Add spinner
            $v.select('#' + e + ' jsv-content jsv-loadmore').innerHTML = spinner;
            
            $v.select('#' + e + ' jsv-content').onscroll = function(){
                   
                if(($v.select('#' + e + ' jsv-content').offsetHeight + $v.select('#' + e + ' jsv-content').scrollTop) == $v.select('#' + e + ' jsv-content').scrollHeight){

                $JSView.query(obj.type, obj.url).then(function(result) {
                    //Code depending on result
                    console.log(JSON.parse(result));

                    //console.group('query');
                    //console.time('query');
                    contentView = '';
                    var resultQuery = JSON.parse(result);
                    for (key in resultQuery) {
                        itemInter = JSVItemsLists[e];
                        for (var x in resultQuery[key]) {
                            if(!resultQuery[key][x]) resultQuery[key][x]='';
                            itemInter = itemInter.replace(new RegExp('{{'+x+'}}', 'g'), resultQuery[key][x]);
                        }
                        contentView += itemInter;
                    }

                    //Add the new contents of the container
                    list.innerHTML += contentView;

                    //console.timeEnd('query');
                    //console.timeEnd();

                }).catch(function() {
                    // an error occurred
                    console.log('An error occurred');
                });

                }

            }
        }
        
        if(obj.addbefore == true){ 
            
            console.log('addbefore');
                        
            $JSView.query(obj.type, obj.url).then(function(result) {
                //Code depending on result
                console.log(JSON.parse(result));

                //console.group('query');
                //console.time('query');
                contentView = '';
                var resultQuery = JSON.parse(result);
                for (key in resultQuery) {
                    itemInter = JSVItemsLists[e];
                    for (var x in resultQuery[key]) {
                        if(!resultQuery[key][x]) resultQuery[key][x]='';
                        itemInter = itemInter.replace(new RegExp('{{'+x+'}}', 'g'), resultQuery[key][x]);
                    }
                    contentView += itemInter;
                }

                //Add the new contents of the container  
                console.log($v.select('#' + e + ' jsv-content jsv-list'));
                console.log($v.select('#' + e + ' jsv-content jsv-list').children);
                console.log($v.select('#' + e + ' jsv-content jsv-list').children[0]);
                console.log($v.select('#' + e + ' jsv-content').scrollTop);
                console.log($v.select('#' + e + ' jsv-content jsv-list').children[0].scrollTop);
                
                var itemFirst = list.children[0];
                
                itemFirst.insertAdjacentHTML('beforebegin', contentView);
                
                console.log(itemFirst.offsetTop);
                
                $v.select('#' + e + ' jsv-content').scrollTop = itemFirst.offsetTop;
                
                $JSView.newContent({
                    text: 'New Content',
                },e);
                
                //console.timeEnd('query');
                //console.timeEnd();

            }).catch(function() {
                // an error occurred
                console.log('An error occurred');
            });

        }
    }
    
}

//This function show or hide modal Spinner
$JSVspinner = {
    show: function(){
        var JSVfullSpinner = $v.select('jsv-fullspinner');
        JSVfullSpinner.classList.add('JSVshowLoading');
        JSVfullSpinner.classList.remove('JSVhideLoading');
        JSVstatusFullSpinner = true;
    },
    hide: function(){
        var JSVfullSpinner = $v.select('jsv-fullspinner');
        JSVfullSpinner.classList.add('JSVhideLoading');
        JSVfullSpinner.classList.remove('JSVshowLoading');
        JSVstatusFullSpinner = false;
    }
}

/**************************/
/**************************/
/**************************/
/***CODE GENERIC ELEMENT***/

$v = {
    select: function(e){
        return document.querySelector(e);
    },
    selectAll: function(e){
        return document.querySelectorAll(e);
    }
}

/*---------------------*/

/**************************/
/**************************/
/**************************/
/******AJAX******/
$JSVRequest = {
    do: function(e,url,viewInit){
        console.log('JSVRequest -> ' + url);
        var req = new XMLHttpRequest();
        req.open('GET', './' + url, true);
        req.onload = function() {
            if (req.status == 200 || req.status == 0) {
                //Save the view in array
                JSVContainersViews[e] = req.responseText;
                //If value of viewInit is true, then must run to start
                if (viewInit == true){
                    $JSView.controller[e](e);
                }
            }
            else {
                console.error('Can´t load -> ' + url);
            }
        };
        req.onerror = function() {
            reject(Error("Network Error"));
        };
        req.send();
    }
}
/*---------------------*/

/*********************/
/*********************/
/*********************/
/******FastClick******/

function FastClick(layer) {
    'use strict';
    var oldOnClick, self = this;
    this.trackingClick = false;
    this.trackingClickStart = 0;
    this.targetElement = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastTouchIdentifier = 0;
    this.layer = layer;

    if (!layer || !layer.nodeType) {
        throw new TypeError('Layer must be a document node');
    }

    this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

    this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

    this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

    this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

    this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

    if (typeof window.ontouchstart === 'undefined') {
        return;
    }

    if (this.deviceIsAndroid) {
        layer.addEventListener('mouseover', this.onMouse, true);
        layer.addEventListener('mousedown', this.onMouse, true);
        layer.addEventListener('mouseup', this.onMouse, true);
    }

    layer.addEventListener('click', this.onClick, true);
    layer.addEventListener('touchstart', this.onTouchStart, false);
    layer.addEventListener('touchend', this.onTouchEnd, false);
    layer.addEventListener('touchcancel', this.onTouchCancel, false);

    if (!Event.prototype.stopImmediatePropagation) {
        layer.removeEventListener = function(type, callback, capture) {
            var rmv = Node.prototype.removeEventListener;
            if (type === 'click') {
                rmv.call(layer, type, callback.hijacked || callback, capture);
            } else {
                rmv.call(layer, type, callback, capture);
            }
        };

        layer.addEventListener = function(type, callback, capture) {
            var adv = Node.prototype.addEventListener;
            if (type === 'click') {
                adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                    if (!event.propagationStopped) {
                        callback(event);
                    }
                }), capture);
            } else {
                adv.call(layer, type, callback, capture);
            }
        };
    }

    if (typeof layer.onclick === 'function') {
        oldOnClick = layer.onclick;
        layer.addEventListener('click', function(event) {
            oldOnClick(event);
        }, false);
        layer.onclick = null;
    }
}

FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);

FastClick.prototype.needsClick = function(target) {
    'use strict';
    switch (target.nodeName.toLowerCase()) {
    case 'button':
    case 'input':

        if (this.deviceIsIOS && target.type === 'file') {
            return true;
        }

        return target.disabled;
    case 'label':
    case 'video':
        return true;
    default:
        return (/\bneedsclick\b/).test(target.className);
    }
};

FastClick.prototype.needsFocus = function(target) {
    'use strict';
    switch (target.nodeName.toLowerCase()) {
    case 'textarea':
    case 'select':
        return true;
    case 'input':
        switch (target.type) {
        case 'button':
        case 'checkbox':
        case 'file':
        case 'image':
        case 'radio':
        case 'submit':
            return false;
        }

        return !target.disabled;
    default:
        return (/\bneedsfocus\b/).test(target.className);
    }
};

FastClick.prototype.sendClick = function(targetElement, event) {
    'use strict';
    var clickEvent, touch;

    if (document.activeElement && document.activeElement !== targetElement) {
        document.activeElement.blur();
    }

    touch = event.changedTouches[0];

    clickEvent = document.createEvent('MouseEvents');
    clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    clickEvent.forwardedTouchEvent = true;
    targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.focus = function(targetElement) {
    'use strict';
    var length;

    if (this.deviceIsIOS && targetElement.setSelectionRange) {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
    } else {
        targetElement.focus();
    }
};

FastClick.prototype.updateScrollParent = function(targetElement) {
    'use strict';
    var scrollParent, parentElement;

    scrollParent = targetElement.fastClickScrollParent;

    if (!scrollParent || !scrollParent.contains(targetElement)) {
        parentElement = targetElement;
        do {
            if (parentElement.scrollHeight > parentElement.offsetHeight) {
                scrollParent = parentElement;
                targetElement.fastClickScrollParent = parentElement;
                break;
            }

            parentElement = parentElement.parentElement;
        } while (parentElement);
    }

    if (scrollParent) {
        scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
    }
};

FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
    'use strict';
    
    if (eventTarget.nodeType === Node.TEXT_NODE) {
        return eventTarget.parentNode;
    }

    return eventTarget;
};

FastClick.prototype.onTouchStart = function(event) {
    'use strict';
    var targetElement, touch, selection;

    targetElement = this.getTargetElementFromEventTarget(event.target);
    touch = event.targetTouches[0];

    if (this.deviceIsIOS) {

        selection = window.getSelection();
        if (selection.rangeCount && !selection.isCollapsed) {
            return true;
        }

        if (!this.deviceIsIOS4) {

            if (touch.identifier === this.lastTouchIdentifier) {
                event.preventDefault();
                return false;
            }
        
            this.lastTouchIdentifier = touch.identifier;

            this.updateScrollParent(targetElement);
        }
    }

    this.trackingClick = true;
    this.trackingClickStart = event.timeStamp;
    this.targetElement = targetElement;

    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;

    if ((event.timeStamp - this.lastClickTime) < 200) {
        event.preventDefault();
    }

    return true;
};

FastClick.prototype.touchHasMoved = function(event) {
    'use strict';
    var touch = event.changedTouches[0];

    if (Math.abs(touch.pageX - this.touchStartX) > 10 || Math.abs(touch.pageY - this.touchStartY) > 10) {
        return true;
    }

    return false;
};

FastClick.prototype.findControl = function(labelElement) {
    'use strict';

    if (labelElement.control !== undefined) {
        return labelElement.control;
    }

    if (labelElement.htmlFor) {
        return document.getElementById(labelElement.htmlFor);
    }

    return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};

FastClick.prototype.onTouchEnd = function(event) {
    'use strict';
    var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

    if (this.touchHasMoved(event)) {
        this.trackingClick = false;
        this.targetElement = null;
    }

    if (!this.trackingClick) {
        return true;
    }

    if ((event.timeStamp - this.lastClickTime) < 200) {
        this.cancelNextClick = true;
        return true;
    }

    this.lastClickTime = event.timeStamp;

    trackingClickStart = this.trackingClickStart;
    this.trackingClick = false;
    this.trackingClickStart = 0;

    if (this.deviceIsIOSWithBadTarget) {
        touch = event.changedTouches[0];
        targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);
    }

    targetTagName = targetElement.tagName.toLowerCase();
    if (targetTagName === 'label') {
        forElement = this.findControl(targetElement);
        if (forElement) {
            this.focus(targetElement);
            if (this.deviceIsAndroid) {
                return false;
            }

            targetElement = forElement;
        }
    } else if (this.needsFocus(targetElement)) {

        if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
            this.targetElement = null;
            return false;
        }

        this.focus(targetElement);

        if (!this.deviceIsIOS4 || targetTagName !== 'select') {
            this.targetElement = null;
            event.preventDefault();
        }

        return false;
    }

    if (this.deviceIsIOS && !this.deviceIsIOS4) {

        scrollParent = targetElement.fastClickScrollParent;
        if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
            return true;
        }
    }

    if (!this.needsClick(targetElement)) {
        event.preventDefault();
        var self = this;
        setTimeout(function(){
            self.sendClick(targetElement, event);
        }, 0);
    }

    return false;
};

FastClick.prototype.onTouchCancel = function() {
    'use strict';
    this.trackingClick = false;
    this.targetElement = null;
};

FastClick.prototype.onMouse = function(event) {
    'use strict';

    if (!this.targetElement) {
        return true;
    }

    if (event.forwardedTouchEvent) {
        return true;
    }

    if (!event.cancelable) {
        return true;
    }

    if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        } else {
            event.propagationStopped = true;
        }

        event.stopPropagation();
        event.preventDefault();

        return false;
    }

    return true;
};

FastClick.prototype.onClick = function(event) {
    'use strict';
    var permitted;

    if (this.trackingClick) {
        this.targetElement = null;
        this.trackingClick = false;
        return true;
    }

    if (event.target.type === 'submit' && event.detail === 0) {
        return true;
    }

    permitted = this.onMouse(event);

    if (!permitted) {
        this.targetElement = null;
    }

    return permitted;
};

FastClick.prototype.destroy = function() {
    'use strict';
    var layer = this.layer;

    if (this.deviceIsAndroid) {
        layer.removeEventListener('mouseover', this.onMouse, true);
        layer.removeEventListener('mousedown', this.onMouse, true);
        layer.removeEventListener('mouseup', this.onMouse, true);
    }

    layer.removeEventListener('click', this.onClick, true);
    layer.removeEventListener('touchstart', this.onTouchStart, false);
    layer.removeEventListener('touchend', this.onTouchEnd, false);
    layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};

FastClick.attach = function(layer) {
    'use strict';
    return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {
    define(function() {
        'use strict';
        return FastClick;
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FastClick.attach;
    module.exports.FastClick = FastClick;
}
/*---------------------*/

/*********************/
/*********************/
/*********************/
/*********Slide*******/
(function(window, doc){
var m = Math,
    dummyStyle = doc.createElement('div').style,
    vendor = (function () {
        var vendors = 't,webkitT,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = vendors.length;

        for ( ; i < l; i++ ) {
            t = vendors[i] + 'ransform';
            if ( t in dummyStyle ) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })(),
    cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

    // Style properties
    transform = prefixStyle('transform'),
    transitionProperty = prefixStyle('transitionProperty'),
    transitionDuration = prefixStyle('transitionDuration'),
    transformOrigin = prefixStyle('transformOrigin'),
    transitionTimingFunction = prefixStyle('transitionTimingFunction'),
    transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
    isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = vendor !== false,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,

    RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
    START_EV = hasTouch ? 'touchstart' : 'mousedown',
    MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
    END_EV = hasTouch ? 'touchend' : 'mouseup',
    CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
    TRNEND_EV = (function () {
        if ( vendor === false ) return false;

        var transitionEnd = {
                ''          : 'transitionend',
                'webkit'    : 'webkitTransitionEnd',
                'Moz'       : 'transitionend',
                'O'         : 'otransitionend',
                'ms'        : 'MSTransitionEnd'
            };

        return transitionEnd[vendor];
    })(),

    nextFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) { return setTimeout(callback, 1); };
    })(),
    cancelFrame = (function () {
        return window.cancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout;
    })(),

    translateZ = has3d ? ' translateZ(0)' : '',

    iScroll = function (el, options) {
        
        var that = this,
            i;

        that.wrapper = typeof el == 'object' ? el : doc.querySelector(el);
        that.wrapper.style.overflow = 'hidden';
        that.scroller = that.wrapper.children[0];

        // Default options
        that.options = {
            advertising: false,
            hScroll: true,
            vScroll: true,
            x: 0,
            y: 0,
            bounce: true,
            bounceLock: false,
            momentum: true,
            lockDirection: true,
            useTransform: true,
            useTransition: false,
            topOffset: 0,
            checkDOMChanges: false,     // Experimental
            handleClick: true,

            // Scrollbar
            hScrollbar: true,
            vScrollbar: true,
            fixedScrollbar: isAndroid,
            hideScrollbar: isIDevice,
            fadeScrollbar: isIDevice && has3d,
            scrollbarClass: '',

            // Zoom
            zoom: false,
            zoomMin: 1,
            zoomMax: 4,
            doubleTapZoom: 2,
            wheelAction: 'scroll',

            // Snap
            snap: false,
            snapThreshold: 1,

            // Events
            onRefresh: null,
            onBeforeScrollStart: function (e) { 
                //e.preventDefault(); //Test Project Puro Rural
                point = e.touches[0];
                pointStartX = point.pageX;
                pointStartY = point.pageY;
                null;
            },
            onScrollStart: null,
            //onBeforeScrollMove: null,
            onBeforeScrollMove: function (e) { 
                deltaX = Math.abs(point.pageX - pointStartX);
                deltaY = Math.abs(point.pageY - pointStartY);
                if (deltaX >= (deltaY+10)) {
                    e.preventDefault(); //Test Project Puro Rural
                } else {
                    null;
                }
            },
            onScrollMove: null,
            onBeforeScrollEnd: null,
            onScrollEnd: null,
            onTouchEnd: null,
            onDestroy: null,
            onZoomStart: null,
            onZoom: null,
            onZoomEnd: null
        };

        // User defined options
        for (i in options) that.options[i] = options[i];
        
        // Set starting position
        that.x = that.options.x;
        that.y = that.options.y;

        // Normalize options
        that.options.useTransform = hasTransform && that.options.useTransform;
        that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
        that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
        that.options.zoom = that.options.useTransform && that.options.zoom;
        that.options.useTransition = hasTransitionEnd && that.options.useTransition;
        
        // Advertising
        that.options.advertising = that.options.advertising;
        
        // Helpers FIX ANDROID BUG!
        // translate3d and scale doesn't work together!
        // Ignoring 3d ONLY WHEN YOU SET that.options.zoom
        if ( that.options.zoom && isAndroid ){
            translateZ = '';
        }
        
        // Set some default styles
        that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
        that.scroller.style[transitionDuration] = '0';
        that.scroller.style[transformOrigin] = '0 0';
        if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
        
        if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
        else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

        if (that.options.useTransition) that.options.fixedScrollbar = true;

        that.refresh();

        that._bind(RESIZE_EV, window);
        that._bind(START_EV);
        if (!hasTouch) {
            if (that.options.wheelAction != 'none') {
                that._bind('DOMMouseScroll');
                that._bind('mousewheel');
            }
        }

        if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
            that._checkDOMChanges();
        }, 500);
    };

// Prototype
iScroll.prototype = {
    enabled: true,
    x: 0,
    y: 0,
    steps: [],
    scale: 1,
    currPageX: 0, currPageY: 0,
    pagesX: [], pagesY: [],
    aniTime: null,
    wheelZoomCount: 0,
    
    handleEvent: function (e) {
        var that = this;
        switch(e.type) {
            case START_EV:
                if (!hasTouch && e.button !== 0) return;
                that._start(e);
                break;
            case MOVE_EV: that._move(e); break;
            case END_EV:
            case CANCEL_EV: that._end(e); break;
            case RESIZE_EV: that._resize(); break;
            case 'DOMMouseScroll': case 'mousewheel': that._wheel(e); break;
            case TRNEND_EV: that._transitionEnd(e); break;
        }
    },
    
    _checkDOMChanges: function () {
        if (this.moved || this.zoomed || this.animating ||
            (this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

        this.refresh();
    },
    
    _scrollbar: function (dir) {
        var that = this,
            bar;

        if (!that[dir + 'Scrollbar']) {
            if (that[dir + 'ScrollbarWrapper']) {
                if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
                that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
                that[dir + 'ScrollbarWrapper'] = null;
                that[dir + 'ScrollbarIndicator'] = null;
            }

            return;
        }

        if (!that[dir + 'ScrollbarWrapper']) {
            // Create the scrollbar wrapper
            bar = doc.createElement('div');

            if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
            else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

            bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

            that.wrapper.appendChild(bar);
            that[dir + 'ScrollbarWrapper'] = bar;

            // Create the scrollbar indicator
            bar = doc.createElement('div');
            if (!that.options.scrollbarClass) {
                bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
            }
            bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
            if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

            that[dir + 'ScrollbarWrapper'].appendChild(bar);
            that[dir + 'ScrollbarIndicator'] = bar;
        }

        if (dir == 'h') {
            that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
            that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
            that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
            that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
            that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
        } else {
            that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
            that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
            that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
            that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
            that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
        }

        // Reset position
        that._scrollbarPos(dir, true);
    },
    
    _resize: function () {
        var that = this;
        setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
    },
    
    _pos: function (x, y) {
        if (this.zoomed) return;

        x = this.hScroll ? x : 0;
        y = this.vScroll ? y : 0;

        if (this.options.useTransform) {
            this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
        } else {
            x = m.round(x);
            y = m.round(y);
            this.scroller.style.left = x + 'px';
            this.scroller.style.top = y + 'px';
        }

        this.x = x;
        this.y = y;

        this._scrollbarPos('h');
        this._scrollbarPos('v');
    },

    _scrollbarPos: function (dir, hidden) {
        var that = this,
            pos = dir == 'h' ? that.x : that.y,
            size;

        if (!that[dir + 'Scrollbar']) return;

        pos = that[dir + 'ScrollbarProp'] * pos;

        if (pos < 0) {
            if (!that.options.fixedScrollbar) {
                size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
                if (size < 8) size = 8;
                that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
            }
            pos = 0;
        } else if (pos > that[dir + 'ScrollbarMaxScroll']) {
            if (!that.options.fixedScrollbar) {
                size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
                if (size < 8) size = 8;
                that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
                pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
            } else {
                pos = that[dir + 'ScrollbarMaxScroll'];
            }
        }

        that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
        that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
        that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
    },
    
    _start: function (e) {
        
        var that = this,
            point = hasTouch ? e.touches[0] : e,
            matrix, x, y,
            c1, c2;

        if (!that.enabled) return;
        
        if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

        if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

        that.moved = false;
        that.animating = false;
        that.zoomed = false;
        that.distX = 0;
        that.distY = 0;
        that.absDistX = 0;
        that.absDistY = 0;
        that.dirX = 0;
        that.dirY = 0;

        // Gesture start
        if (that.options.zoom && hasTouch && e.touches.length > 1) {
            c1 = m.abs(e.touches[0].pageX-e.touches[1].pageX);
            c2 = m.abs(e.touches[0].pageY-e.touches[1].pageY);
            that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

            that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
            that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

            if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
        }

        if (that.options.momentum) {
            if (that.options.useTransform) {
                // Very lame general purpose alternative to CSSMatrix
                matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
                y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
            }
            
            if (x != that.x || y != that.y) {
                if (that.options.useTransition) that._unbind(TRNEND_EV);
                else cancelFrame(that.aniTime);
                that.steps = [];
                that._pos(x, y);
                if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
            }
        }

        that.absStartX = that.x;    // Needed by snap threshold
        that.absStartY = that.y;

        that.startX = that.x;
        that.startY = that.y;
        that.pointX = point.pageX;
        that.pointY = point.pageY;

        that.startTime = e.timeStamp || Date.now();

        if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

        that._bind(MOVE_EV, window);
        that._bind(END_EV, window);
        that._bind(CANCEL_EV, window);
    },
    
    _move: function (e) {
        var that = this,
            point = hasTouch ? e.touches[0] : e,
            deltaX = point.pageX - that.pointX,
            deltaY = point.pageY - that.pointY,
            newX = that.x + deltaX,
            newY = that.y + deltaY,
            c1, c2, scale,
            timestamp = e.timeStamp || Date.now();

        if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

        // Zoom
        if (that.options.zoom && hasTouch && e.touches.length > 1) {
            c1 = m.abs(e.touches[0].pageX - e.touches[1].pageX);
            c2 = m.abs(e.touches[0].pageY - e.touches[1].pageY);
            that.touchesDist = m.sqrt(c1*c1+c2*c2);

            that.zoomed = true;

            scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

            if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
            else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

            that.lastScale = scale / this.scale;

            newX = this.originX - this.originX * that.lastScale + this.x;
            newY = this.originY - this.originY * that.lastScale + this.y;

            this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

            if (that.options.onZoom) that.options.onZoom.call(that, e);
            return;
        }

        that.pointX = point.pageX;
        that.pointY = point.pageY;

        // Slow down if outside of the boundaries
        if (newX > 0 || newX < that.maxScrollX) {
            newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
        }
        if (newY > that.minScrollY || newY < that.maxScrollY) {
            newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
        }

        that.distX += deltaX;
        that.distY += deltaY;
        that.absDistX = m.abs(that.distX);
        that.absDistY = m.abs(that.distY);

        if (that.absDistX < 6 && that.absDistY < 6) {
            return;
        }

        // Lock direction
        if (that.options.lockDirection) {
            if (that.absDistX > that.absDistY + 5) {
                newY = that.y;
                deltaY = 0;
            } else if (that.absDistY > that.absDistX + 5) {
                newX = that.x;
                deltaX = 0;
            }
        }

        that.moved = true;
        that._pos(newX, newY);
        that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        if (timestamp - that.startTime > 300) {
            that.startTime = timestamp;
            that.startX = that.x;
            that.startY = that.y;
        }
        
        if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
    },
    
    _end: function (e) {
        if (hasTouch && e.touches.length !== 0) return;

        var that = this,
            point = hasTouch ? e.changedTouches[0] : e,
            target, ev,
            momentumX = { dist:0, time:0 },
            momentumY = { dist:0, time:0 },
            duration = (e.timeStamp || Date.now()) - that.startTime,
            newPosX = that.x,
            newPosY = that.y,
            distX, distY,
            newDuration,
            snap,
            scale;

        that._unbind(MOVE_EV, window);
        that._unbind(END_EV, window);
        that._unbind(CANCEL_EV, window);

        if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

        if (that.zoomed) {
            scale = that.scale * that.lastScale;
            scale = Math.max(that.options.zoomMin, scale);
            scale = Math.min(that.options.zoomMax, scale);
            that.lastScale = scale / that.scale;
            that.scale = scale;

            that.x = that.originX - that.originX * that.lastScale + that.x;
            that.y = that.originY - that.originY * that.lastScale + that.y;
            
            that.scroller.style[transitionDuration] = '200ms';
            that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;
            
            that.zoomed = false;
            that.refresh();

            if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
            return;
        }

        if (!that.moved) {
            if (hasTouch) {
                if (that.doubleTapTimer && that.options.zoom) {
                    // Double tapped
                    clearTimeout(that.doubleTapTimer);
                    that.doubleTapTimer = null;
                    if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
                    that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
                    if (that.options.onZoomEnd) {
                        setTimeout(function() {
                            that.options.onZoomEnd.call(that, e);
                        }, 200); // 200 is default zoom duration
                    }
                } else if (this.options.handleClick) {
                    that.doubleTapTimer = setTimeout(function () {
                        that.doubleTapTimer = null;

                        // Find the last touched element
                        target = point.target;
                        while (target.nodeType != 1) target = target.parentNode;

                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
                            ev = doc.createEvent('MouseEvents');
                            ev.initMouseEvent('click', true, true, e.view, 1,
                                point.screenX, point.screenY, point.clientX, point.clientY,
                                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                                0, null);
                            ev._fake = true;
                            target.dispatchEvent(ev);
                        }
                    }, that.options.zoom ? 250 : 0);
                }
            }

            that._resetPos(400);

            if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
            return;
        }

        if (duration < 300 && that.options.momentum) {
            momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
            momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

            newPosX = that.x + momentumX.dist;
            newPosY = that.y + momentumY.dist;

            if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
            if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
        }

        if (momentumX.dist || momentumY.dist) {
            newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

            // Do we need to snap?
            if (that.options.snap) {
                distX = newPosX - that.absStartX;
                distY = newPosY - that.absStartY;
                if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
                else {
                    snap = that._snap(newPosX, newPosY);
                    newPosX = snap.x;
                    newPosY = snap.y;
                    newDuration = m.max(snap.time, newDuration);
                }
            }

            that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

            if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
            return;
        }

        // Do we need to snap?
        if (that.options.snap) {
            distX = newPosX - that.absStartX;
            distY = newPosY - that.absStartY;
            if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
            else {
                snap = that._snap(that.x, that.y);
                
                if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
                
                //ADVERTISING TRUE, SNAP WITH DIFERENT WIDTH BETWEEN 1 AND 3 ITEMS   
                console.log('pagesX -> ' + that.pagesX.length);
                if(that.options.advertising && (that.currPageX==1 || that.currPageX==that.pagesX.length))
                    if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x+70, snap.y, snap.time);
            }

            if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
            return;
        }

        that._resetPos(200);
        if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
    },
    
    _resetPos: function (time) {
        var that = this,
            resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
            resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

        if (resetX == that.x && resetY == that.y) {
            if (that.moved) {
                that.moved = false;
                if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);      // Execute custom code on scroll end
            }

            if (that.hScrollbar && that.options.hideScrollbar) {
                if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
                that.hScrollbarWrapper.style.opacity = '0';
            }
            if (that.vScrollbar && that.options.hideScrollbar) {
                if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
                that.vScrollbarWrapper.style.opacity = '0';
            }

            return;
        }

        that.scrollTo(resetX, resetY, time || 0);
    },

    _wheel: function (e) {
        var that = this,
            wheelDeltaX, wheelDeltaY,
            deltaX, deltaY,
            deltaScale;

        if ('wheelDeltaX' in e) {
            wheelDeltaX = e.wheelDeltaX / 12;
            wheelDeltaY = e.wheelDeltaY / 12;
        } else if('wheelDelta' in e) {
            wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
        } else if ('detail' in e) {
            wheelDeltaX = wheelDeltaY = -e.detail * 3;
        } else {
            return;
        }
        
        if (that.options.wheelAction == 'zoom') {
            deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
            if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
            if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;
            
            if (deltaScale != that.scale) {
                if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
                that.wheelZoomCount++;
                
                that.zoom(e.pageX, e.pageY, deltaScale, 400);
                
                setTimeout(function() {
                    that.wheelZoomCount--;
                    if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
                }, 400);
            }
            
            return;
        }
        
        deltaX = that.x + wheelDeltaX;
        deltaY = that.y + wheelDeltaY;

        if (deltaX > 0) deltaX = 0;
        else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

        if (deltaY > that.minScrollY) deltaY = that.minScrollY;
        else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;
    
        if (that.maxScrollY < 0) {
            that.scrollTo(deltaX, deltaY, 0);
        }
    },
    
    _transitionEnd: function (e) {
        var that = this;

        if (e.target != that.scroller) return;

        that._unbind(TRNEND_EV);
        
        that._startAni();
    },


    /**
    *
    * Utilities
    *
    */
    _startAni: function () {
        var that = this,
            startX = that.x, startY = that.y,
            startTime = Date.now(),
            step, easeOut,
            animate;

        if (that.animating) return;
        
        if (!that.steps.length) {
            that._resetPos(400);
            return;
        }
        
        step = that.steps.shift();
        
        if (step.x == startX && step.y == startY) step.time = 0;

        that.animating = true;
        that.moved = true;
        
        if (that.options.useTransition) {
            that._transitionTime(step.time);
            that._pos(step.x, step.y);
            that.animating = false;
            if (step.time) that._bind(TRNEND_EV);
            else that._resetPos(0);
            return;
        }

        animate = function () {
            var now = Date.now(),
                newX, newY;

            if (now >= startTime + step.time) {
                that._pos(step.x, step.y);
                that.animating = false;
                if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);            // Execute custom code on animation end
                that._startAni();
                return;
            }

            now = (now - startTime) / step.time - 1;
            easeOut = m.sqrt(1 - now * now);
            newX = (step.x - startX) * easeOut + startX;
            newY = (step.y - startY) * easeOut + startY;
            that._pos(newX, newY);
            if (that.animating) that.aniTime = nextFrame(animate);
        };

        animate();
    },

    _transitionTime: function (time) {
        time += 'ms';
        this.scroller.style[transitionDuration] = time;
        if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
        if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
    },

    _momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
        var deceleration = 0.0006,
            speed = m.abs(dist) / time,
            newDist = (speed * speed) / (2 * deceleration),
            newTime = 0, outsideDist = 0;

        // Proportinally reduce speed if we are outside of the boundaries
        if (dist > 0 && newDist > maxDistUpper) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
        }

        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;

        return { dist: newDist, time: m.round(newTime) };
    },

    _offset: function (el) {
        var left = -el.offsetLeft,
            top = -el.offsetTop;
            
        while (el = el.offsetParent) {
            left -= el.offsetLeft;
            top -= el.offsetTop;
        }
        
        if (el != this.wrapper) {
            left *= this.scale;
            top *= this.scale;
        }

        return { left: left, top: top };
    },

    _snap: function (x, y) {
        var that = this,
            i, l,
            page, time,
            sizeX, sizeY;

        // Check page X
        page = that.pagesX.length - 1;
        for (i=0, l=that.pagesX.length; i<l; i++) {
            if (x >= that.pagesX[i]) {
                page = i;
                break;
            }
        }
        if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
        x = that.pagesX[page];
        sizeX = m.abs(x - that.pagesX[that.currPageX]);
        sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
        that.currPageX = page;

        // Check page Y
        page = that.pagesY.length-1;
        for (i=0; i<page; i++) {
            if (y >= that.pagesY[i]) {
                page = i;
                break;
            }
        }
        if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
        y = that.pagesY[page];
        sizeY = m.abs(y - that.pagesY[that.currPageY]);
        sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
        that.currPageY = page;

        // Snap with constant speed (proportional duration)
        time = m.round(m.max(sizeX, sizeY)) || 200;

        return { x: x, y: y, time: time };
    },

    _bind: function (type, el, bubble) {
        (el || this.scroller).addEventListener(type, this, !!bubble);
    },

    _unbind: function (type, el, bubble) {
        (el || this.scroller).removeEventListener(type, this, !!bubble);
    },


    /**
    *
    * Public methods
    *
    */
    destroy: function () {
        var that = this;

        that.scroller.style[transform] = '';

        // Remove the scrollbars
        that.hScrollbar = false;
        that.vScrollbar = false;
        that._scrollbar('h');
        that._scrollbar('v');

        // Remove the event listeners
        that._unbind(RESIZE_EV, window);
        that._unbind(START_EV);
        that._unbind(MOVE_EV, window);
        that._unbind(END_EV, window);
        that._unbind(CANCEL_EV, window);
        
        if (!that.options.hasTouch) {
            that._unbind('DOMMouseScroll');
            that._unbind('mousewheel');
        }
        
        if (that.options.useTransition) that._unbind(TRNEND_EV);
        
        if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);
        
        if (that.options.onDestroy) that.options.onDestroy.call(that);
    },

    refresh: function () {
        var that = this,
            offset,
            i, l,
            els,
            pos = 0,
            page = 0;

        if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
        that.wrapperW = that.wrapper.clientWidth || 1;
        that.wrapperH = that.wrapper.clientHeight || 1;

        that.minScrollY = -that.options.topOffset || 0;
        that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
        that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
        that.maxScrollX = that.wrapperW - that.scrollerW;
        that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
        that.dirX = 0;
        that.dirY = 0;

        if (that.options.onRefresh) that.options.onRefresh.call(that);

        that.hScroll = that.options.hScroll && that.maxScrollX < 0;
        that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

        that.hScrollbar = that.hScroll && that.options.hScrollbar;
        that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

        offset = that._offset(that.wrapper);
        that.wrapperOffsetLeft = -offset.left;
        that.wrapperOffsetTop = -offset.top;

        // Prepare snap
        if (typeof that.options.snap == 'string') {
            that.pagesX = [];
            that.pagesY = [];
            els = that.scroller.querySelectorAll(that.options.snap);
            for (i=0, l=els.length; i<l; i++) {
                pos = that._offset(els[i]);
                pos.left += that.wrapperOffsetLeft;
                pos.top += that.wrapperOffsetTop;
                that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
                that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
            }
        } else if (that.options.snap) {
            that.pagesX = [];
            while (pos >= that.maxScrollX) {
                that.pagesX[page] = pos;
                pos = pos - that.wrapperW;
                page++;
            }
            if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

            pos = 0;
            page = 0;
            that.pagesY = [];
            while (pos >= that.maxScrollY) {
                that.pagesY[page] = pos;
                pos = pos - that.wrapperH;
                page++;
            }
            if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
        }

        // Prepare the scrollbars
        that._scrollbar('h');
        that._scrollbar('v');

        if (!that.zoomed) {
            that.scroller.style[transitionDuration] = '0';
            that._resetPos(400);
        }
    },

    scrollTo: function (x, y, time, relative) {
        var that = this,
            step = x,
            i, l;

        that.stop();

        if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
        
        for (i=0, l=step.length; i<l; i++) {
            if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
            that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
        }

        that._startAni();
    },

    scrollToElement: function (el, time) {
        var that = this, pos;
        el = el.nodeType ? el : that.scroller.querySelector(el);
        if (!el) return;

        pos = that._offset(el);
        pos.left += that.wrapperOffsetLeft;
        pos.top += that.wrapperOffsetTop;

        pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
        pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
        time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

        that.scrollTo(pos.left, pos.top, time);
    },

    scrollToPage: function (pageX, pageY, time) {
        var that = this, x, y;
        
        time = time === undefined ? 400 : time;

        if (that.options.onScrollStart) that.options.onScrollStart.call(that);

        if (that.options.snap) {
            pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
            pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

            pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
            pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

            that.currPageX = pageX;
            that.currPageY = pageY;
            x = that.pagesX[pageX];
            y = that.pagesY[pageY];
        } else {
            x = -that.wrapperW * pageX;
            y = -that.wrapperH * pageY;
            if (x < that.maxScrollX) x = that.maxScrollX;
            if (y < that.maxScrollY) y = that.maxScrollY;
        }

        that.scrollTo(x, y, time);
    },

    disable: function () {
        this.stop();
        this._resetPos(0);
        this.enabled = false;

        // If disabled after touchstart we make sure that there are no left over events
        this._unbind(MOVE_EV, window);
        this._unbind(END_EV, window);
        this._unbind(CANCEL_EV, window);
    },
    
    enable: function () {
        this.enabled = true;
    },
    
    stop: function () {
        if (this.options.useTransition) this._unbind(TRNEND_EV);
        else cancelFrame(this.aniTime);
        this.steps = [];
        this.moved = false;
        this.animating = false;
    },
    
    zoom: function (x, y, scale, time) {
        var that = this,
            relScale = scale / that.scale;

        if (!that.options.useTransform) return;

        that.zoomed = true;
        time = time === undefined ? 200 : time;
        x = x - that.wrapperOffsetLeft - that.x;
        y = y - that.wrapperOffsetTop - that.y;
        that.x = x - x * relScale + that.x;
        that.y = y - y * relScale + that.y;

        that.scale = scale;
        that.refresh();

        that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
        that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

        that.scroller.style[transitionDuration] = time + 'ms';
        that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
        that.zoomed = false;
    },
    
    isReady: function () {
        return !this.moved && !this.zoomed && !this.animating;
    }
};

function prefixStyle (style) {
    if ( vendor === '' ) return style;

    style = style.charAt(0).toUpperCase() + style.substr(1);
    return vendor + style;
}

dummyStyle = null;  // for the sake of it

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})(window, document);
/*---------------------*/


/*! Hammer.JS - v2.0.6 - 2015-12-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2015 Jorik Tangelder;
 * Licensed under the  license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean=false} [merge]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.6';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');


/*********************/
/*********************/
/*********************/
/********Spinner******/
var spinner = '<div class="JSVspinnerBlack"><svg viewBox="0 0 64 64"><g stroke-width="4" stroke-linecap="round"><line y1="12" y2="20" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg></div>';

/* HEMOS EL ELMENTO div POR EL ELEMENTO jsv-fullspinner*/

var spinnerModal = '<jsv-fullspinner class="JSVcontainer JSVcontainerTransition JSVhideLoading"><div id="JSVgifLoading"><div class="JSVspinnerWhite"><svg viewBox="0 0 64 64"><g stroke-width="4" stroke-linecap="round"><line y1="12" y2="20" transform="translate(32,32) rotate(180)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(210)"><animate attributeName="stroke-opacity" dur="750ms" values="0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(240)"><animate attributeName="stroke-opacity" dur="750ms" values=".1;0;1;.85;.7;.65;.55;.45;.35;.25;.15;.1" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(270)"><animate attributeName="stroke-opacity" dur="750ms" values=".15;.1;0;1;.85;.7;.65;.55;.45;.35;.25;.15" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(300)"><animate attributeName="stroke-opacity" dur="750ms" values=".25;.15;.1;0;1;.85;.7;.65;.55;.45;.35;.25" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(330)"><animate attributeName="stroke-opacity" dur="750ms" values=".35;.25;.15;.1;0;1;.85;.7;.65;.55;.45;.35" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(0)"><animate attributeName="stroke-opacity" dur="750ms" values=".45;.35;.25;.15;.1;0;1;.85;.7;.65;.55;.45" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(30)"><animate attributeName="stroke-opacity" dur="750ms" values=".55;.45;.35;.25;.15;.1;0;1;.85;.7;.65;.55" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(60)"><animate attributeName="stroke-opacity" dur="750ms" values=".65;.55;.45;.35;.25;.15;.1;0;1;.85;.7;.65" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(90)"><animate attributeName="stroke-opacity" dur="750ms" values=".7;.65;.55;.45;.35;.25;.15;.1;0;1;.85;.7" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(120)"><animate attributeName="stroke-opacity" dur="750ms" values=".85;.7;.65;.55;.45;.35;.25;.15;.1;0;1;.85" repeatCount="indefinite"></animate></line><line y1="12" y2="20" transform="translate(32,32) rotate(150)"><animate attributeName="stroke-opacity" dur="750ms" values="1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1" repeatCount="indefinite"></animate></line></g></svg></div></div></jsv-fullspinner>';
/*---------------------*/