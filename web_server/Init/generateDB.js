/**
 * Created by Mathiisss on 01/10/2016.
 */
var request = require('request').defaults({encoding: null});
var query_factory = require('../server/query_factory');
var abort = false;
var mysql = require('../server/mysql_connection');
mysql = mysql.connection(true);

module.exports.doIt = function (nb, cb) {

    var pokemonList = ['Aymericko', 'Bulbizarre', 'Herbizarre', 'Florizarre', 'Salamèche', 'Reptincel', 'Dracaufeu', 'Carapuce', 'Carabaffe', 'Tortank', 'Chenipan', 'Chrysacier',
        'Papilusion', 'Aspicot', 'Coconfort', 'Dardargnan', 'Roucool', 'Roucoups', 'Roucarnage', 'Rattata', 'Rattatac', 'Piafabec', 'Rapasdepic', 'Abo', 'Arbok',
        'Pikachu', 'Raichu', 'Sabelette', 'Sablaireau', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Mélofée', 'Mélodelfe', 'Goupix',
        'Feunard', 'Rondoudou', 'Grodoudou', 'Nosferapti', 'Nosferalto', 'Mystherbe', 'Ortide', 'Rafflésia', 'Paras', 'Parasect', 'Mimitoss', 'Aéromite', 'Taupiqueur',
        'Triopikeur', 'Miaouss', 'Persian', 'Psykokwak', 'Akwakwak', 'Férosinge', 'Colossinge', 'Caninos', 'Arcanin', 'Ptitard', 'Têtarte', 'Tartard', 'Abra', 'Kadabra',
        'Alakazam', 'Machoc', 'Machopeur', 'Mackogneur', 'Chétiflor', 'Boustiflor', 'Empiflor', 'Tentacool', 'Tentacruel', 'Racaillou', 'Gravalanch', 'Grolem', 'Ponyta',
        'Galopa', 'Ramoloss', 'Flagadoss', 'Magnéti', 'Magnéton', 'Canarticho', 'Doduo', 'Dodrio', 'Otaria', 'Lamantine', 'Tadmorv', 'Grotadmorv', 'Kokiyas', 'Crustabri',
        'Fantominus', 'Spectrum', 'Ectoplasma', 'Onix', 'Soporifik', 'Hypnomade', 'Krabby', 'Krabboss', 'Voltorbe', 'Électrode', 'Nœunœuf', 'Noadkoko', 'Osselait', 'Ossatueur',
        'Kicklee', 'Tygnon', 'Excelangue', 'Smogo', 'Smogogo', 'Rhinocorne', 'Rhinoféros', 'Leveinard', 'Saquedeneu', 'Kangourex', 'Hypotrempe', 'Hypocéan', 'Poissirène', 'Poissoroy',
        'Stari', 'Staross', 'M. Mime', 'Insécateur', 'Lippoutou', 'Élektek', 'Magmar', 'Scarabrute', 'Tauros', 'Magicarpe', 'Léviator', 'Lokhlass', 'Métamorph', 'Évoli', 'Aquali',
        'Voltali', 'Pyroli', 'Porygon', 'Amonita', 'Amonistar', 'Kabuto', 'Kabutops', 'Ptéra', 'Ronflex', 'Artikodin', 'Électhor', 'Sulfura', 'Minidraco', 'Draco', 'Dracolosse', 'Mewtwo', 'Mew'];
    var usersTab = [];
    var pictureUser = [];

    var randomInList = function (tab) {
        return tab[(Math.floor(Math.random() * (tab.length)))];
    };

    var add_pictures = function (i) {
        index = i-1;
        if (i > 0) {
            request.get(pictureUser[index].content, function (error, response, body) {
                if (error || response.statusCode != 200)
                    cb(true, 'error encoding picture in creation of user : ' + error);
                else {
                    pictureUser[index].content = "data:image/png;base64," + new Buffer(body).toString('base64');
                    var query = query_factory.make_query('Insert', 'pictures', pictureUser[index]);
                    mysql.query(query, function (err, data) {
                        if (err)
                            cb(true, 'error adding picture in databse /' + err);
                        else {
                            console.log('Picture added: ' + (nb - i) + '/' + nb);
                            add_pictures(i - 1);
                        }
                    });
                }
            })
        }
        else {
            console.log('pictures added successfully.');
            cb(false);
        }
    };

    var add_oneUserTags = function(info, turn){
        if (info.k > 0) {
            var tag = {};
            tag.users_id = info.users_id;
            tag.tags_id = info.tag_list[info.k - 1];
            var query = query_factory.make_query('Insert', 'users_has_tags', tag);
            mysql.query(query, function (err, data) {
                if (err) {
                    console.log(tag);
                    cb(true, 'error adding on rel in users has tag in database /' + err);
                }else {
                    info.k--;
                    add_oneUserTags(info, turn);
                }
            });
        }
        else {
            add_usersTags(turn -1);
        }
    };

    var add_usersTags = function(i) {
        if (i > 0) {
            var info = {};
            var tmp;
            info.tag_list = [];
            var rdm = 10 + Math.floor(Math.random() * 10);
            info.users_id = i;
            for (var j = 0; j < rdm ; j++) {
                tmp = 1 + Math.floor(Math.random() * 150);
                if (info.tag_list.indexOf(tmp) == -1)
                    info.tag_list.push(tmp);
                if ((j+1) == rdm){
                    info.k = info.tag_list.length;
                    add_oneUserTags(info, i);
                }
            }
        }
        else {
            console.log('all tags of user added..')
            add_pictures(nb);
        }
    };

    var fetch_users = function (i) {
        request('https://randomuser.me/api/?inc=gender,name,email,login,picture&results=' + i, function (error, response, body) {
            if (error && response.statusCode != 200)
                cb(true, response);
            else {
                usersTab = JSON.parse(body).results;
                add_users(nb);
            }
        });
    };

    var add_tags = function (i) {
        if (i > 0) {
            var tag = {};
            tag.id = i;
            tag.name = pokemonList[i];
            var query = query_factory.make_query('Insert', 'tags', tag);
            mysql.query(query, function (err, data) {
                if (err)
                    console.log(err);
                else {
                    add_tags(i - 1);
                }
            });
        }
        else {
            console.log('tags added..')
            fetch_users(nb);
        }
    };

    var dropDb = function (internCb) {
        var fs = require('fs');

        fs.readFile(__dirname + '/initStructureDB.sql', 'utf8', function (err, data) {
            if (err) {
                internCb(true, 'error reading initStructureDb.sql :' + err);
            } else {
                mysql.query(data, function (err) {
                    if (err) {
                        internCb(true, 'error initialing db initStructureDb.sql' + err);
                    } else {
                        data = null;
                        console.log('The database has been purged. adding values...')
                        add_tags(150);
                    }
                })
            }
        });
    };

    //JUST DO IIITTTT !
    dropDb(cb);

    var add_users = function (i) {
        index = i -1;
        if (i > 0) {
            var user = {};
            var picture = {};
            picture.users_id = i;
            picture.content = usersTab[index].picture.large;
            picture.main = 1;
            pictureUser.push(picture);
            user.id = i;
            user.sex = (usersTab[index].gender == 'female' ? 'F' : 'M');
            user.pseudo = usersTab[index].login.username + require('../tools/key').random_string(6);
            //all fake user have 'qwerty' password
            user.password = '4a636445c480c7658599aa0c247be4892903aad67f18b9122e8750385073cd56ef51b571d0655812e0429d7c4cad4a4942c0176c003aa1d034b81ad70bb4876c';
            user.salt = '3ae1a841036d626c';
            user.mail = require('../tools/key').random_string(6) + usersTab[index].email;
            user.first_name = usersTab[index].name.first;
            user.last_name = usersTab[index].name.last;
            user.orientation = randomInList(['M', 'F', 'B']);
            user.age = 18 + (Math.floor(Math.random()* 62));
            user.bio = "I'm a " + usersTab[index].gender + " like all the other.";
            user.loca_lat = 44 + Math.random() * 5;
            user.loca_lng = -1 + Math.random() * 7;
            user.score = Math.floor(Math.random() * 100);
            user.cookie_key = require('../tools/key').random_string(42);
            user.mail_verif = 'OK';
            user.last_connected = '' + Math.floor(Math.random() * 10) + 2006
                + ':' + Math.floor(Math.random() * 12)
                + ':' + Math.floor(Math.random() * 28)
                + ':' + Math.floor(Math.random() * 24)
                + ':' + Math.floor(Math.random() * 60)
                + ':' + Math.floor(Math.random() * 60);
            var query = query_factory.make_query('Insert', 'users', user);
            mysql.query(query, function (err, data) {
                if (err)
                    cb(true, 'error adding user in databse /' + err);
                else {
                    add_users(i - 1);
                }
            });
        }
        else {
            console.log('users added successfully.');
            add_usersTags(nb);
        }
    };
}
;