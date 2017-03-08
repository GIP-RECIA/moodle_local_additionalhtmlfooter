var wwwroot = window.location.pathname.split("/")[1];

/**
 * Affichage de l'option dans la page
 */
$(function() {
	// On regarde le rôle de l'utilisateur
	$.ajax({
		type: "GET",
	    url: "/" + wwwroot + "/moodle28/local/additionalhtmlfooter/advanced_user.php",
	    async: false,
	    success: function(data, textStatus, jqXHR) {
	    	var json = JSON.parse(data);
	    	var advancedUser = json.advancedUser;
	    	messages = json.messages;
	    	
	    	// Si l'utilisateur est un enseignant standard ou avancé
	    	if(advancedUser >= 0) {
	    		
	    		// On ajoute l'option dans le menu en haut à droite
	    		var menu = $("header ul.pull-right ul.dropdown-menu:first hr.hr_menu:last").parent();
	    		menu.before("<li>"
	    				+ "		<a onclick='changeUserRole()'>"
	    				+ "			<img class='profileicon' src='/" + wwwroot + "/moodle28/pix/i/switchrole.png'>"
	    				+ 			getText("changer_role", advancedUser)
	    				+ "		</a>"
	    				+ "	</li>");
	    		
	    		// On ajoute le bouton si on est dans la page du profil
	    		if(window.location.pathname.indexOf("user/profile.php") > -1) {
	    			$("div#page header nav").append("<div class='singlebutton'>" +
	    					"	<input type='submit' onclick='changeUserRole()' value='" + getText("changer_role", advancedUser) + "'>" +
	    			"</div>");
	    		}
	    	}
	    	
	    	// On ouvre la popup du choix des activités/ressources si necessaire
	    	var section = new RegExp("section=([-\\w]+)").exec(window.location.search);
	    	if(section != null) {
	    		// Timeout nécessaire pour Chrome & IE
	    		setTimeout(function() {
	    			$("li#" + section[1] + " span.section-modchooser-text").click();
	    			
	    			// Cas de Safari
	    			if($("div.alloptions").is(":hidden")) {
	    				var elt = $("li#" + section[1] + " span.section-modchooser-text")[0];
	    				var evObj = document.createEvent('MouseEvents');
	    				evObj.initMouseEvent('click', true, true, window);
	    				elt.dispatchEvent(evObj);
	    			}
	    		}, 500);
	    	}
	    }
	});
});

/**
 * Lorsqu'on clique sur "Ajouter une activité ou une ressource"
 */
var openedSectionId = null;
$("span.section-modchooser-link").on("click", function() {
	// On mémorise le lien cliqué pour pouvoir ré-ouvrir la popup si la page est rechargée 
	openedSectionId = $(this).parent().parent().parent().parent().parent().attr("id");
	
	// On ajoute l'option dans le choix des activités/ressources
	var advancedUser = $("div.alloptions a[onclick='changeUserRole()']");
	if(advancedUser.length == 0) {		
		var text = $("header ul.pull-right ul.dropdown-menu:first img[src='/" + wwwroot + "/moodle28/pix/i/switchrole.png']").parent().text().trim();
		$("div.alloptions").prepend("<div style='padding: 10px; background-color: #FFFFFF;'>"
				+ "		<a onclick='changeUserRole()'>"
				+ "			<img class='profileicon' src='../pix/i/switchrole.png'>"
				+ 			text
				+ "		</a>"
				+ "	</div>");
	}
});

$("form#chooserform").on("submit", function() {
	alert("test");
});

/**
 * Change le rôle de l'utilisateur (enseignant standard ou avancé)
 */
function changeUserRole() {
	var text = $("header ul.pull-right ul.dropdown-menu:first img[src='/" + wwwroot + "/moodle28/pix/i/switchrole.png']").parent().text().trim();
	var advancedUser = text == getText("changer_role", "0") ? "0" : "1";
	
	// Si l'utilisateur confirme son choix
	if(confirm(getText("confirmer_role", advancedUser)) == true) {
		$.ajax({
			type: "GET",
			url: "/" + wwwroot + "/moodle28/local/additionalhtmlfooter/advanced_user.php?change",
			async: false,
			success: function(data, textStatus, jqXHR) {
				var json = JSON.parse(data);
		    	var advancedUser = json.advancedUser;
		    	messages = json.messages;
				
				// On met à jour le texte dans le menu en haut à droite
				$("header ul.pull-right ul.dropdown-menu:first img[src='/" + wwwroot + "/moodle28/pix/i/switchrole.png']").parent().html("<img class='profileicon' src='/" + wwwroot + "/moodle28/pix/i/switchrole.png'>" + getText("changer_role", advancedUser));
				
				// On met à jour le bouton si on est dans la page du profil
				if(window.location.pathname.indexOf("user/profile.php") > -1) {
					var button = $("div#page header nav input[onclick='changeUserRole()']");
					button.attr("value", getText("changer_role", advancedUser));
					button.blur();
				}
				
				// On recharge la page si on est dans le contenu d'un cours
				var form = $("form[action$='course/view.php'][method='post']");
				if(form.length == 1) {
					// Si la popup du choix des activités/ressources est affichée
					if($("form#chooserform").is(":visible")) {
						var url = window.location.href.replace(new RegExp("(#.+)"), "");
						document.location.href = url.replace(new RegExp("&section=([-\\w]+)"), "") + "&section=" + openedSectionId;
					} else {
						document.location.href = window.location.href.replace(new RegExp("&section=([-\\w]+)"), "");						
					}
				}
			}
		});
	}
	
	// On replie le menu en haut à droite
	$("header ul.pull-right").click();
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
var messages;
function getText(message, advancedUser) {
/** Correction du code issu d'une grande incompétence du développeur :
        var lang = new RegExp('[^\]+\\((.*?)\\)').exec($("header ul:first a:first").text())[1];
        var userRole = advancedUser == "0" ? "-standard" : "-avance";
        return messages[lang][message + userRole]; */
        var lang=$("html").attr("lang");
        var userRole = advancedUser == "0" ? "-standard" : "-avance";
        return messages[lang]?messages[lang][message + userRole]:messages["en"][message + userRole];
}
