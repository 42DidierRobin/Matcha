/**
 * Created by rdidier on 9/24/16.
 */

module.exports.create = function(pseudo, type) {

    var notif  = '';

    if (type == 1)
        notif = "The user " + pseudo + " just liked you !";
    else if (type == 2)
        notif = "The user " + pseudo + " just visited your profile";
    else if (type == 3)
        notif = "You have a new matched with " + pseudo + " !";
    else if (type == 4)
        notif = "The user " + pseudo + " doesn't liked you anymore :(!";
    else
        return (false);

    return (notif);
};