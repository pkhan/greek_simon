//wat
$(document).ready(function() {
    $('.container').css('z-index','-1');
});

test("hello world test", function() {
    equal( "1", "1", "wat");
});

test("generate code", function() {
    function get_code(pool, dups) {
        var code, num_chars, type;
        code = game_mgr.generate_code(pool, dups);
        num_chars = pool.length;
        type = 3; //number
        //type = "";
        //equals(typeof(code), typeof(type));
        equal(code.length, num_chars, "generated code of correct length: " + num_chars + " -- " + print_code(code));
        var i = 0;
        var used = [];
        for(i = 0; i < code.length; i++) {
            var num = code[i];
            equal(typeof(num), typeof(type), "code position " + i + " is a " + typeof(type));
            ok(num >= 0 && num < num_chars, "code position " + i + " is in the correct range?: " + num);
            if(!dups) {
                ok( used.indexOf(num) === -1, "number is unique? " + print_code(used));
            }
            used.push(num);
        }
    }
    function print_code(code) {
        var result = "";
        var i = 0;
        for(i = 0; i < code.length; i++) {
            result += String(code[i]) + "-";
        }
        return result;
    }
    ok(game_mgr.generate_code([]).length === 0, "optional parameter fine");
    get_code([], false);
    get_code([0], false);
    get_code([0,1,2,3,4,5,6,7,8,9], false);
    get_code([0,1,2,3,4,5,6,7,8,9], true);
});

test("check char", function() {
    var start_code = [2,3,4,5,12];
    ok(game_mgr.check_char(start_code,[2]), "check first char");
    ok(game_mgr.check_char(start_code,[2,3]), "check second char");
    ok(game_mgr.check_char(start_code,start_code), "check all char");
    ok(!game_mgr.check_char(start_code,[-1]), "check wrong first char");
    ok(!game_mgr.check_char(start_code,[2,4]), "check wrong second char");
    ok(!game_mgr.check_char(start_code,[2,3,4,5,17]), "check wrong last char");
});

test("add player", function() {
    equal(game_mgr.players.length, 0, "starting number of players is 0?");
    ok(game_mgr.add_player(0),"add player 0 OK?");
    equal(game_mgr.players.length, 1, "added 1 player, length of players 1?");
    ok(!game_mgr.add_player(0), "add player 0 returns false?")
    equal(game_mgr.players.length, 1, "added 1 player, length of players 1?");
    game_mgr.players = [];
});

test("display manager", function() {
    ok(display_mgr.instructions !== undefined, "instructions defined?");
    equal(display_mgr.rows.length, 3, "rows defined?");
    display_mgr.add_box();
    var boxes = $('.letter_box');
    var parents = [];
    boxes.each(function (){
        parents.push($(this).parent());
    });
    equal(boxes.length, 3, "added 3 boxes?");
    ok(parents[0].id == 'row1' && parents[1].id == 'row2' && parents[2].id == 'row3', "boxes have correct parents?");
});


