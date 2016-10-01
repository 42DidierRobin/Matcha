/**
 * Created by Mathiisss on 01/10/2016.
 */
var randomUser = require('random-user');
var request = require('request').defaults({encoding: null});

module.exports.doIt = function (nb, cb) {

    var userTab = [], pictureTab = [], userTagsTab = [];
    var tagsTab = ['Bulbizarre', 'Herbizarre', 'Florizarre', 'Salamèche', 'Reptincel', 'Dracaufeu', 'Carapuce', 'Carabaffe', 'Tortank', 'Chenipan', 'Chrysacier',
        'Papilusion', 'Aspicot', 'Coconfort', 'Dardargnan', 'Roucool', 'Roucoups', 'Roucarnage', 'Rattata', 'Rattatac', 'Piafabec', 'Rapasdepic', 'Abo', 'Arbok',
        'Pikachu', 'Raichu', 'Sabelette', 'Sablaireau', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Mélofée', 'Mélodelfe', 'Goupix',
        'Feunard', 'Rondoudou', 'Grodoudou', 'Nosferapti', 'Nosferalto', 'Mystherbe', 'Ortide', 'Rafflésia', 'Paras', 'Parasect', 'Mimitoss', 'Aéromite', 'Taupiqueur',
        'Triopikeur', 'Miaouss', 'Persian', 'Psykokwak', 'Akwakwak', 'Férosinge', 'Colossinge', 'Caninos', 'Arcanin', 'Ptitard', 'Têtarte', 'Tartard', 'Abra', 'Kadabra',
        'Alakazam', 'Machoc', 'Machopeur', 'Mackogneur', 'Chétiflor', 'Boustiflor', 'Empiflor', 'Tentacool', 'Tentacruel', 'Racaillou', 'Gravalanch', 'Grolem', 'Ponyta',
        'Galopa', 'Ramoloss', 'Flagadoss', 'Magnéti', 'Magnéton', 'Canarticho', 'Doduo', 'Dodrio', 'Otaria', 'Lamantine', 'Tadmorv', 'Grotadmorv', 'Kokiyas', 'Crustabri',
        'Fantominus', 'Spectrum', 'Ectoplasma', 'Onix', 'Soporifik', 'Hypnomade', 'Krabby', 'Krabboss', 'Voltorbe', 'Électrode', 'Nœunœuf', 'Noadkoko', 'Osselait', 'Ossatueur',
        'Kicklee', 'Tygnon', 'Excelangue', 'Smogo', 'Smogogo', 'Rhinocorne', 'Rhinoféros', 'Leveinard', 'Saquedeneu', 'Kangourex', 'Hypotrempe', 'Hypocéan', 'Poissirène', 'Poissoroy',
        'Stari', 'Staross', 'M. Mime', 'Insécateur', 'Lippoutou', 'Élektek', 'Magmar', 'Scarabrute', 'Tauros', 'Magicarpe', 'Léviator', 'Lokhlass', 'Métamorph', 'Évoli', 'Aquali',
        'Voltali', 'Pyroli', 'Porygon', 'Amonita', 'Amonistar', 'Kabuto', 'Kabutops', 'Ptéra', 'Ronflex', 'Artikodin', 'Électhor', 'Sulfura', 'Minidraco', 'Draco', 'Dracolosse', 'Mewtwo', 'Mew']

    var randomInList = function (tab) {
        return tab[(Math.floor(Math.random() * (tab.length)))];
    };

    var loop = function (nb) {
        if (nb == 0)
            toDb();
        randomUser().then(function (res) {
            // --------------- Creation user
            var user = {};
            user.id = nb;
            user.sex = (res.gender == 'female' ? 'F' : 'M');
            user.pseudo = res.login.username;
            //all fake user have 'qwerty' password
            user.password = '4a636445c480c7658599aa0c247be4892903aad67f18b9122e8750385073cd56ef51b571d0655812e0429d7c4cad4a4942c0176c003aa1d034b81ad70bb4876c';
            user.salt = '3ae1a841036d626c';
            user.mail = res.email;
            user.first_name = res.name.first;
            user.last_name = res.name.last;
            user.orientation = randomInList(['M', 'F', 'B']);
            user.bio = "I'm a " + res.gender + " like all the other.";
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
            userTab.push(user);

            // ----------------- creation photo for user
            var picture = {};
            picture.users_id = nb;
            picture.main = 1;

            request.get(res.picture.thumbnail, function (error, response, body) {
                if (error || response.statusCode != 200)
                    cb(true, 'error encoding picture in creation of user : ' + error);
                else {
                    picture.content = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
                    pictureTab.push(picture);

                    // ----------------- Association of tags
                    var rdm = Math.floor(Math.random() * 10) + 5;
                    for (var i = 0; i < rdm; i++) {
                        var tag = {};
                        tag.users_id = nb;
                        tag.id = Math.floor(Math.random() * 151);
                        userTagsTab.push(tag);
                        if ((i + 1) == rdm) {
                            res = null;
                            //next
                            loop(nb - 1);
                        }
                    }
                }
            });
        }).catch(function (err) {
            cb(true, 'error with randomUser module : ');
        });
    };

    var toDb = function () {
        dropDb(function (err, data) {
            if (err) {
                console.log(data);
                cb(true, 'error when dropping/creating new sql structure /');
            }
            else {
                console.log('The entire databse has been purged. New data adding... ');

            }
        })
    };

    var dropDb = function (internCb) {
        var fs = require('fs');
        var mysql = require('../server/mysql_connection');
        mysql = mysql.connection(true);

        fs.readFile(__dirname + '/initStructureDB.sql', 'utf8', function (err,data) {
            if (err) {
                internCb(true, 'error reading initStructureDb.sql :' + err);
            }else {
                mysql.query(data, function(err){
                    if (err){
                        internCb(true, 'error initialing db initStructureDb.sql' + err);
                    }else{
                        internCb(false);
                    }
                })
            }
        });
    };

    loop(nb - 1);
};