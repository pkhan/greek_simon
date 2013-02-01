//Add IE 7/8 support (Lord knows WHY)
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (element) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (this[i] === element) {
                return i;
            }
        }
        return -1;
    };
}

var display_mgr = {
    rows: [],
    box_html: "<div class='letter_box'></div>",
    instructions: undefined,
    per_letter: 750, //per letter delay in ms
    add_box: function () {
        var i, row;
        for (i = 0; i < this.rows.length; i++) {
            row = $(this.rows[i]);
            row.append(this.box_html);
        }
    },
    show_row: function (row_index) {
        this.rows.eq(row_index).find('.letter_box').css('visibility', 'visible');
    },
    show_box: function () {
        this.rows[0].filter(function () {
            return $(this).css('visibility') === 'hidden';
        }).first().css('visibility', 'visible');
    },
    add_letter: function (letter, row_index, wrong) {
        wrong = opt(wrong, false);
        var boxes, target;
        boxes = this.rows.eq(row_index).find('.letter_box');
        target = boxes.filter(function () {
            return this.innerHTML === "";
        });
        target[0].innerHTML = letter;
        if (wrong) {
            target.eq(0).addClass('wrong');
        }
        sound_mgr.play_sound(mappings.greek_to_x(letter));
    },
    blink: function (letter, row_index) {
        var boxes, target;
        boxes = this.rows.eq(row_index).find('.letter_box');
        target = boxes.filter(function () {
            return this.innerHTML === letter;
        });
        target.css('background-color', 'white');
        setTimeout(function () {
            target.css('background-color', 'inherit');
        }, 200);

    },
    clear_row: function (row_index) {
        this.rows.eq(row_index).find('.letter_box').text('').removeClass('wrong');
    },
    clear_row_d: function (row_index, delay) {
        var self = this;
        setTimeout(function () {
            self.clear_row(row_index);
        }, delay);
    },
    play_code: function (code, row_index) {
        //code is array of characters, row index is 0-2
        var i;

        for (i = 0; i < code.length; i++) {
            this.add_letter_d(code[i], row_index, this.per_letter * (i + 1));
        }
    },
    add_letter_d: function (letter, row_index, delay) {
        var self = this;
        if (delay > 0) {
            setTimeout(function () {
                self.add_letter(letter, row_index);
            }, delay);
        } else {
            this.add_letter(letter, row_index);
        }
    },
    set_instructions: function (new_instructions) {
        this.instructions.innerHTML = new_instructions;
    },
    update_lives: function (num_lives) {
        var left, right;
        left = $('ul.lives.left li');
        right = $('ul.lives.right li');
        left.slice(0, num_lives).text(String.fromCharCode(8226));
        left.slice(num_lives, left.length).text('');
        right.slice(0, num_lives).text(String.fromCharCode(8226));
        right.slice(num_lives, right.length).text('');
        if (num_lives <= 1) {
            $('ul.lives').addClass('one');
        } else {
            $('ul.lives').removeClass('one');
        }
    }
};

var sound_mgr = {
    sounds: undefined,
    play_sound: function (x) {
        try {
            this.stop_all();
            if (this.sounds[x]) {
                this.sounds[x].play();
            }
        } catch(error) {
        }
    },
    stop_all: function () {
        var i;
        for (i = 0; i < this.sounds.length; i++) {
            this.sounds[i].pause();
            this.sounds[i].currentTime = 0;
        }
    }
};

$(document).ready(function () {
    display_mgr.rows = $('.letter_row');
    display_mgr.instructions = $('div.instruction')[0];
    display_mgr.update_lives(game_mgr.lives);
    timer.disp = $('.timer')[0];
    sound_mgr.sounds = document.querySelectorAll('audio.greek_audio');
    //debug
    //display_mgr.add_box()

});

//possible state: pre_registration, registration, input, confirmation, wait
var game_mgr = {
    state: "pre_registration",
    players: [],
    lives: 1,
    set_lives: function (num_lives) {
        this.lives = num_lives;
        display_mgr.update_lives(num_lives);
    },
    lose_life: function () {
        this.lives -= 1;
        display_mgr.update_lives(this.lives);
    },
    current_code: 0,
    rounds: 3,
    add_player: function (x) {
        if (this.players.indexOf(x) === -1) {
            this.players.push(x);
            return true;
        }
        return false;
    },
    get_index: function (charCode) {
        return this.players.indexOf(charCode);
    },
    codes : [],
    inputs : [],
    now_code: function () {
        return this.codes[this.current_code];
    },
    now_input: function () {
        return this.inputs[this.current_code];
    },
    generate_code: function (pool, dups) {
        dups = opt(dups, false);
        var num_items, code, i;
        num_items = pool.length;
        code = [];

        if (dups) {
            for (i = 0; i < num_items; i++) {
                code.push(pool[Math.floor(Math.random() * num_items)]);
            }
        } else {
            for (i = 0; i < num_items; i++) {
                code.push(pool[i]);
            }

            code.sort(function (a, b) {
                if (Math.random() < 0.5) {
                    return -1;
                }
                return 1;
            });
        }
        return code;
    },
    add_codes: function (rounds) {
        var i;
        for (i = 0; i < rounds; i++) {
            this.codes.push(this.generate_code(this.players, false));
            this.inputs.push([]);
        }
    },
    check_char: function (good_code, input_code) {
        var i, x;
        i = 0;
        x = input_code.length - 1;
        if (good_code[x] === input_code[x]) {
            return true;
        }
        return false;
    },
    add_input: function (x, current) {
        current = opt(current, this.current_code);
        var good_code, input_code;
        good_code = this.codes[current];
        input_code = this.inputs[current];
        input_code.push(x);
        return this.check_char(good_code, input_code);
    }
};

var mappings = {
//all mappings are based on an a-z code, a being 0 and alpha
    x_to_greek: function (index) { //0 is lowercase alpha
        return String.fromCharCode(index + 945);
    },
    greek_to_x: function (letter) {
        return letter.charCodeAt(0) - 945;
    },
    input_to_alpha: function (charCode) {
        return String.fromCharCode(charCode);
    },
    input_to_x: function (charCode) {
        return charCode - 97;
    },
    code_to_greek: function (code) {
        var i, greek_code;
        greek_code = [];
        for (i = 0; i < code.length; i++) {
            greek_code.push(this.x_to_greek(code[i]));
        }
        return greek_code;
    }
};

var timer = {
    disp: undefined,
    timeout: undefined,
    set_timer: function (on_complete, time_ms) {
        this.cancel();
        var self, time_sec;
        self = this;
        time_sec = Math.ceil(time_ms / 1000);
        time_ms = time_sec * 1000;
        this.update_timer(time_sec);
        if (time_ms > 0) {
            this.timeout = setTimeout(function () {
                self.set_timer(on_complete, time_ms - 1000);
            }, 1000);
        } else {
            on_complete();
        }
    },
    update_timer: function (new_time) {
        this.disp.innerHTML = this.pad_num(new_time, 3);
    },
    pad_num: function (number, digits) {
        var string = String(number);
        while (string.length < digits) {
            string = "0" + string;
        }
        return string;
    },
    cancel: function () {
        try {
            clearTimeout(this.timeout);
        } catch (err) {

        }
        this.update_timer(0);
    }
};

function opt(arg, def) {
    //helper function for default values on optional params
    if (typeof arg === 'undefined') {
        return def;
    }
    return arg;
}

$(document).keypress(function (evt) {
    check_state(evt.which);
});

function check_state(charCode) {
    console.log(charCode);
    var x = mappings.input_to_x(charCode);
    if (game_mgr.state === "pre_registration") {
        if (charCode >= 49 && charCode <= 57) { //1 thru 9
            game_mgr.set_lives(charCode - 48);
        } else {
            display_mgr.set_instructions("REGISTER ALL INPUTS");
            game_mgr.state = "registration";
            //timer.set_timer(end_registration, 10000);
        }
    } else if (game_mgr.state === "registration") {
        if (charCode >= 97 && charCode <= 108) { //a thru l 
            if (game_mgr.add_player(x)) {
                display_mgr.add_box();
                display_mgr.add_letter(mappings.x_to_greek(x), 0);
            } else {
                display_mgr.blink(mappings.x_to_greek(x), 0);
            }
        } else if (charCode >= 48 && charCode <= 57) { //0 thru 9
            game_mgr.set_lives(charCode - 48);
        } else if (charCode === 13) {
            //timer.cancel();
            end_registration();
        }
    } else if (game_mgr.state === "input") {
        if (charCode >= 97 && charCode <= 108) { //a thru l 
            var correct = game_mgr.add_input(x);
            display_mgr.add_letter(mappings.x_to_greek(x), game_mgr.current_code, !correct);
            if (!correct) {
                game_mgr.state = "wait";
                fail_round();
            } else if (game_mgr.now_code().length === game_mgr.now_input().length) {
                game_mgr.state = "wait";
                if (game_mgr.current_code === game_mgr.rounds - 1) {
                    do_win();
                } else {
                    game_mgr.current_code += 1;
                    start_round();
                }
            }
        }
    } else if (game_mgr.state === "confirmation") {
        if (charCode >= 97 && charCode <= 108) {
            input_letter(charCode);
        }
    } else if (game_mgr.state === "wait") {
        //do nothing
    }
}

function end_registration() {
    //display_mgr.clear_row(game_mgr.current_code);
    game_mgr.state = "wait";
    if (game_mgr.players.length === 0) {
        do_lose();
    } else {
        game_mgr.add_codes(game_mgr.rounds);
        start_round();
    }
}

function start_round() {
    var current = game_mgr.current_code;
    var code = game_mgr.codes[current];
    display_mgr.clear_row(current);
    game_mgr.inputs[current] = [];
    display_mgr.show_row(current);
    display_mgr.play_code(mappings.code_to_greek(code), current);
    display_mgr.set_instructions("CODE " + (game_mgr.current_code + 1) + " TEST");
    timer.set_timer(begin_input, (game_mgr.players.length + 1) * display_mgr.per_letter);
}

function begin_input() {
    var current = game_mgr.current_code;
    display_mgr.clear_row(current);
    game_mgr.state = "input";
    display_mgr.set_instructions("ENTER CODE " + (game_mgr.current_code + 1));
    timer.set_timer(fail_round, 30000);
}

function fail_round() {
    timer.cancel();
    game_mgr.lose_life();
    if (game_mgr.lives > 0) {
        display_mgr.set_instructions('INCORRECT CODE - RESTARTING');
        //game_mgr.lives -= 1;
        //display_mgr.clear_row_d(game_mgr.current_code, 1000);
        setTimeout(start_round, 1000);
    } else {
        do_lose();
    }
}

function start_confirmation_phase() {
    game_mgr.state = "confirmation";
    display_mgr.clear_letters();

}

function end_confirmation_phase() {
    var i;
    var code = game_mgr.codes[game_mgr.current_code];
    var input = game_mgr.confirms[game_mgr.current_code];
    var same = true;

    game_mgr.cancel_delay();

    for (i = 0; i < code.length; i++) {
        if (code[i] !== input[i]) {
            same = false;
            break;
        }
    }

    alert(same);
}

function rewind_lines(num_lines) {
    var delay, i;
    for (i = 0; i < num_lines; i++) {
        delay = Math.floor(Math.random() * 5000);
        setTimeout(add_line, delay);
    }
}

function add_line() {
    var line_html, height, top_pos, life, line_elem;

    line_html = "<div class='rewind_line' style='";
    height = Math.ceil(Math.random() * 3);
    top_pos = Math.floor(Math.random() * $(window).height());
    life = Math.floor(Math.random() * 5000);
    line_html += "border-width:" + height + "px;top:" + top_pos + "px;' ></div>";
    $('body').append(line_html);
    line_elem = $('body .rewind_line').last();
    setTimeout(function () {
        line_elem.remove();
    }, life);
}

function do_win() {
    timer.cancel();
    //server stuff here
    display_mgr.set_instructions('ALL CODES CORRECT - PROCEED');
}

function do_lose() {
    display_mgr.set_instructions('INCORRECT CODE - YOU LOSE');
    $('div').addClass('wrong');
    //reach out to server here
}
