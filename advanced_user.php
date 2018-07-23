<?php
require_once(dirname(__FILE__) . '/../../config.php');
require_once($CFG->dirroot . '/lib/moodlelib.php');

/*
 * On initialise le rôle de l'utilisateur : 
 * -1 => Non enseignant
 *  0 => Enseignant standard
 *  1 => Enseignant avancé
 */
if(!isset($USER->advancedUser)) {
	$USER->advancedUser = -1;
	$roles = getRoles();
	if(user_has_role_assignment($USER->id, $roles["teacher"]) || user_has_role_assignment($USER->id, $roles["editingteacher"])) { 
		if(user_has_role_assignment($USER->id, $roles["advancedteacher"])) {
			$USER->advancedUser = 1;
		} else {		
			$USER->advancedUser = 0;
		}
	}
}

// Si l'utilisateur veut changer de rôle
if($USER->advancedUser != -1 && isset($_GET["change"])) {
	$roles = getRoles();
	if($USER->advancedUser == 0) {
		// On assigne le rôle advancedteacher
		role_assign($roles["advancedteacher"], $USER->id, context_system::instance());
		$USER->advancedUser = 1;
	} else {
		// On efface le rôle advancedteacher 
		role_unassign($roles["advancedteacher"], $USER->id, context_system::instance()->id);
		$USER->advancedUser = 0;
	}

	// On remet à jour les droits
	unset($USER->access);
	$USER->access = get_user_accessdata($USER->id);
}

// On renvoie les messages et le rôle de l'utilisateur
require_once($CFG->dirroot . '/local/additionalhtmlfooter/lang/en/advanced_user.php');
$messages_en = $string;
require_once($CFG->dirroot . '/local/additionalhtmlfooter/lang/fr/advanced_user.php');
$messages_fr = $string;
echo json_encode(array("messages" => array("en" => $messages_en, "fr" => $messages_fr), "advancedUser" => $USER->advancedUser));

/**
 * Récupère tous les rôles : <br>
 * Exemple : <br>
 * $roles["teacher"] = 3 <br>
 * $roles["advancedteacher"] = 9 <br>
 * ...
 */
function getRoles() {
	global $DB;
	
	$roles = array();
	$roleassignments = $DB->get_records_sql("SELECT r.id, r.shortname FROM {role} r");
	foreach ($roleassignments as $ra) {
		$roles[$ra->shortname] = $ra->id;
	}
	return $roles;
}
?>
