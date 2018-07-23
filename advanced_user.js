var wwwroot = window.location.pathname.split("/")[1];
var messages = null;
var advancedUser = null;
var openedSectionId = null;
var trigger_modal = null;
/**
 * Affichage de l'option dans la page
 */
$(function() {
	// On regarde le rôle de l'utilisateur
	$.ajax({
		type: "GET",
        url: "/" + wwwroot + "/local/additionalhtmlfooter/advanced_user.php",
	    async: false,
	    success: function(data, textStatus, jqXHR) {
	    	var json = JSON.parse(data);
	    	advancedUser = parseInt(json.advancedUser);
	    	messages = json.messages;

	    	if(advancedUser !== -1) {
	    		var user_menu = $('.navbar.navbar-netocentre .navbar-nav:last a[data-title="logout,moodle"]').parent();
                user_menu.append('<a href="javascript:changeUserRole();" class="dropdown-item menu-action"><i class="fa fa-user"></i>' + getText("changer_role", advancedUser) + '</a>');
	    		
	    		// On ajoute le bouton si on est dans la page du profil
	    		if($("body#page-user-profile").length > 0) {
	    			var profil_header = $("header#page-header #page-title .singlebutton:last").parent();
                    profil_header.append('<div class="singlebutton"><a href="javascript:changeUserRole();" class="btn btn-primary"><i class="fa fa-user"></i>' + getText("changer_role", advancedUser) + '</a></div>');
	    		}
	    	}
	    	
	    	// On ouvre la popup du choix des activités/ressources si necessaire
	    	var section = new RegExp("section=([-\\w]+)").exec(window.location.search);
	    	if(section != null) {
	    		trigger_modal = setInterval(function(){
	    			if($("li#" + section[1] + " span.section-modchooser-text").closest("a").length > 0){
                        $("li#" + section[1] + " span.section-modchooser-text").trigger("click");
                        clearInterval(trigger_modal);
                    }
                }, 500);
	    	}
	    }
	});
});

/**
 * Lorsqu'on clique sur "Ajouter une activité ou une ressource"
 */
$("span.section-modchooser-link").on("click", function() {
	// On mémorise le lien cliqué pour pouvoir ré-ouvrir la popup si la page est rechargée 
	openedSectionId = $(this).parent().parent().parent().parent().parent().attr("id");
	
	// On ajoute l'option dans le choix des activités/ressources
	if(advancedUser !== undefined && advancedUser !== -1 && $(".alloptions a[href='javascript:changeUserRole();']").length === 0) {
		$("div.alloptions").prepend('<div><a href="javascript:changeUserRole();" class="btn btn-primary btn-block"><i class="fa fa-user"></i>' + getText("changer_role", advancedUser) + '</a></div>');
	}
});

/**
 * Change le rôle de l'utilisateur (enseignant standard ou avancé)
 */
function changeUserRole() {
	if(confirm(getText("confirmer_role", advancedUser)) == true) {
		$.ajax({
			type: "GET",
			url: "/" + wwwroot + "/local/additionalhtmlfooter/advanced_user.php?change",
			async: false,
			success: function(data, textStatus, jqXHR) {
				var json = JSON.parse(data);
		    	var advancedUser = json.advancedUser;
		    	messages = json.messages;


		    	if($("body#page-course-view-topics").length > 0){
                    if($("form#chooserform").is(":visible")) {
                        var url = window.location.href.replace(new RegExp("(#.+)"), "");
                        document.location.href = url.replace(new RegExp("&section=([-\\w]+)"), "") + "&section=" + openedSectionId;
                    } else {
                        document.location.href = window.location.href.replace(new RegExp("&section=([-\\w]+)"), "");
                    }
				}else{
		    		location.reload();
				}
			}
		});
	}
}

/************************************************************************************************************************/
/**											GESTION DES MESSAGES SELON LA LANGUE										*/
/************************************************************************************************************************/

/**
 * message : message souhaité <br>
 * advancedUser : 	0 si on est utilisateur standard,
 * 					1 si on est utilisateur avancé <br><br>
 * 
 * Exemple : <br>
 * getText("changer_role", "0") => messages[lang]["changer_role-standard"] <br>
 * getText("confirmer_role", "1") => messages[lang]["confirmer_role-avance"]
 */
function getText(message, advancedUser) {
/** Correction du code issu d'une grande incompétence du développeur :
        var lang = new RegExp('[^\]+\\((.*?)\\)').exec($("header ul:first a:first").text())[1];
        var userRole = advancedUser == "0" ? "-standard" : "-avance";
        return messages[lang][message + userRole]; */
        var lang=$("html").attr("lang");
        var userRole = advancedUser == "0" ? "-standard" : "-avance";
        return messages[lang]?messages[lang][message + userRole]:messages["en"][message + userRole];
}
