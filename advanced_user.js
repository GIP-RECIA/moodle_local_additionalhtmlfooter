const wwwroot = window.location.pathname.split("/")[1];
let messages = null;
let advancedUser = null;

/**
 * Affichage de l'option dans la page
 */
document.addEventListener('DOMContentLoaded', function() {
    // On regarde le rôle de l'utilisateur
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/" + wwwroot + "/local/additionalhtmlfooter/advanced_user.php", false);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const json = JSON.parse(xhr.responseText);
            advancedUser = parseInt(json.advancedUser);
            messages = json.messages;

            if (advancedUser !== -1) {
                const dividers = document.querySelectorAll('nav.navbar div#user-action-menu div#carousel-item-main div.dropdown-divider');
                const lastDivider = dividers[dividers.length - 1];
                const aTag = document.createElement('a');
                aTag.href = "javascript:changeUserRole();";
                aTag.className = "dropdown-item";
                aTag.text = getText("changer_role", advancedUser);
                lastDivider.parentNode.insertBefore(aTag, lastDivider);

                // On ajoute le bouton si on est dans la page du profil
                if (document.getElementById('page-user-profile') != null) {
                	const profil_header = document.querySelector("header#page-header div.singlebutton").parentNode;
                    const divTag = document.createElement('div');
                    divTag.className = "singlebutton";
                    divTag.innerHTML = '<a href="javascript:changeUserRole();" class="btn btn-primary"> ' + getText("changer_role", advancedUser) + '</a>';
                    profil_header.appendChild(divTag);
                }
            }
        }
    };
    xhr.send();
});

/**
 * Change le rôle de l'utilisateur (enseignant standard ou avancé)
 */
function changeUserRole() {
    if (confirm(getText("confirmer_role", advancedUser)) == true) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/" + wwwroot + "/local/additionalhtmlfooter/advanced_user.php?change", false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                advancedUser = json.advancedUser;
                messages = json.messages;
                location.reload();
            }
        };
        xhr.send();
    }
}

/**
 * GESTION DES MESSAGES SELON LA LANGUE
 */
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
    const lang = document.querySelector("html").getAttribute("lang");
    return messages[lang in messages ? lang : "en"][message + (advancedUser === 0 ? "-standard" : "-avance")];
}