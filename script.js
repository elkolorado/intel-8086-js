let codeEditor = document.getElementById('terminal');
let lineCounter = document.getElementById('lineCounter');

let lineCountCache = 0;
function line_counter() {
    let lineCount = codeEditor.value.split('\n').length;
    let outarr = new Array();
    if (lineCountCache != lineCount) {
        for (let x = 0; x < lineCount; x++) {
            outarr[x] = (x + 1) + '.';
        }
        lineCounter.value = outarr.join('\n');
    }
    lineCountCache = lineCount;
}

codeEditor.addEventListener('scroll', () => {
    lineCounter.scrollTop = codeEditor.scrollTop;
    lineCounter.scrollLeft = codeEditor.scrollLeft;
});

codeEditor.addEventListener('input', () => {
    line_counter();
});



line_counter();

       
const log = console.log.bind(console)
console.log = (...args) => {
    log(...args)
    $('.console').append(`<p>${args}</p>`)
}

const loge = console.error.bind(console)
console.error = (...args) => {
    loge(...args)
    $('.console').append(`<p class="text-danger">${args} on line ${_l+1}</p>`)

}


let stack = {
    ax: "0000",
    bx: "0000",
    cx: "0000",
    dx: "0000",
    ah: "00",
    al: "00",
    bh: "00",
    bl: "00",
    ch: "00",
    cl: "00",
    dh: "00",
    dl: "00",
    bp: "0000",
    di: "0000",
    si: "0000",
    tx: "0000",
    tl: "00",
    th: "00",
    sp: "0000"
}

function clearBios() {
    let entry = {
        ax: "0000",
        bx: "0000",
        cx: "0000",
        dx: "0000",
        ah: "00",
        al: "00",
        bh: "00",
        bl: "00",
        ch: "00",
        cl: "00",
        dh: "00",
        dl: "00",
        bp: "0000",
        di: "0000",
        si: "0000"
    }
    $('.console').html('')
    Object.keys(Object.fromEntries(Object.entries(entry).filter(([key]) => !key.includes('x')))).forEach(key => {
        document.getElementById(key).innerHTML = entry[key];
    });
}

// deklaracja zmiennych dla pamięci operacyjnej
let memory = new Array(65536 * 2).fill('00');
dumpMemory(memory)
// deklaracja zmiennej dla stosu
let sp = 65535;



function getValue(name) {
    return document.getElementById(name?.toLowerCase()).value;
}

function setValue(name, set) {
    name = name?.toLowerCase();

    if (/^0x[0-9A-Fa-f]{0,4}$/.test(set)) {
        set = set.replace("0x", "")
        if (/^(ax|bx|cx|dx|tx)$/i.test(name)) {
            stack[name] = set.padStart(4, 0);
            stack[name.slice(0, -1) + 'h'] = set.padStart(4, 0).substring(0, 2).padStart(2, 0);
            stack[name.slice(0, -1) + 'l'] = set.padStart(4, 0).slice(-2).padStart(2, 0);

        } else if (/^[0-9A-Fa-f]{0,4}$/.test(set)) {
            if (/^(bp|di|si|sp)$/i.test(name)) {
                stack[name] = set.padStart(4, 0);
            }
            if (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(name) && /^[0-9A-Fa-f]{0,2}$/.test(set)) {
                stack[name] = set;
                stack[name.slice(0, -1) + 'x'] = stack[name.slice(0, -1) + 'h'] + stack[name.slice(0, -1) + 'l'];
            }
        } else {
            console.error("compilation error")
        }

    }
    else if (/^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(name) && /^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(set)) {
        set = set?.toLowerCase();
        if (/^(ax|bx|cx|dx|tx)$/i.test(name)) {
            stack[name] = stack[set];
            stack[name.slice(0, -1) + 'h'] = stack[set].substring(0, 2).padStart(2, 0);
            stack[name.slice(0, -1) + 'l'] = stack[set].slice(-2).padStart(2, 0);
        } else {
            stack[name] = stack[set];
        }
    }
    else if (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(name) && /^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(set)) {
        set = set?.toLowerCase();
        stack[name] = stack[set];
        stack[name.slice(0, -1) + 'x'] = stack[name.slice(0, -1) + 'h'] + stack[name.slice(0, -1) + 'l'];
    }

    else {
        console.error("compilation error");
    }

    run();
}

function run() {
    Object.keys(Object.fromEntries(Object.entries(stack).filter(([key]) => !key.includes('x')))).filter(([key]) => !key.includes('t')).forEach(key => {
        document.getElementById(key).innerHTML = stack[key];
    });
}
let _l;
function parseTerminal() {
    _l = 0;
    const start = Date.now();

    clearBios();

    let terminal = getValue("terminal");
    let stack = terminal?.split("\n").map(i => i.trim());

    stack.forEach((command, line) => {
        tryCommand(command)
        _l++
        
    })
    $('#mem').html('')
    const end = Date.now();
    console.log(`Compile & run execution: ${end - start} ms`);
    dumpMemory(memory)
    const dump = Date.now();
    console.log(`Memory dump execution: ${dump - start} ms`);

}

function tryCommand(command) {
    if (/^mov /i.test(command)) {
        mov(command)
    }

    else if (/^xchg /i.test(command)) {
        xchg(command)
    }

    else if (/^pop /i.test(command)) {
        pop(command)
    }

    else if (/^push /i.test(command)) {
        push(command)
    }

    else if (command.length == 0) {

    }
    else {
        console.error("compilation error")
    }

}

function testWord(values, i) {
    return /^(ax|bx|cx|dx|bp|di|si|sp|ah|al|bh|bl|ch|cl|dh|dl|tx|th|tl)$/i.test(values[i])
}

function testHex(value) {
    return /^0x[0-9a-fA-F]{0,4}$/.test(value)
}

function testBazowe(value) {
    return /^\[|\]$/.test(value)
}

// function testHex(h) {
//     let hex = h.toString(16);
//     return hex.match(/^[0-9a-fA-F]+$/) && !isNaN(parseInt(hex, 16));
// }

function setBaseMemory(adress, register) {
    adress = adress.replace(/\[|]/gi, "")?.toLowerCase();
    _adress = adress
    index = 0;
    let displacement = 0;
    let obj = []
    //base
    if (/^(bp|bx|sp)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {
        displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        adress = adress?.split("+")[0]
    }

    //index
    if (/^(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {

        displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        adress = adress?.split("+")[0]
    }

    //base-index
    if (/^(bp|bx)\+(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {
        if (adress?.split("+").length == 3) {
            displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        }
        index = adress?.split("+")[1]
        adress = adress?.split("+")[0]
    }

    if (/^(bp|bx|sp)$/i.test(adress)
        || /^(si|di)$/i.test(adress)
        || /^(bp|bx)\+(si|di)$/i.test(_adress)
        || /^(bp|bx)\+(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)
        || /^(bp|bx)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)
        || /^(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)) {
        if (/^(ax|bx|cx|dx|tx)$/i.test(register)) {
            obj.push(parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0), register.slice(0, -1) + 'l', parseInt(stack[adress], 16) + 1 + displacement + (parseInt(stack[index], 16) || 0), register.slice(0, -1) + 'h')
            memory[obj[0]] = stack[obj[1]]
            memory[obj[2]] = stack[obj[3]]
        }
        else if (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(register)) {
            obj.push(parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0), register)
            memory[obj[0]] = stack[obj[1]]
        }
        else {
            console.error("compilation error");
        }
    }
    return obj
}

function readBaseMemory(register, adress, instant = true) {
    adress = adress.replace(/\[|]/gi, "")?.toLowerCase();
    _adress = adress
    index = 0;
    let displacement = 0;
    let obj = []
    //base
    if (/^(bp|bx|sp)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {
        displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        adress = adress?.split("+")[0]
    }

    //index
    if (/^(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {

        displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        adress = adress?.split("+")[0]
    }

    //base-index
    if (/^(bp|bx)\+(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(adress)) {
        if (adress?.split("+").length == 3) {
            displacement = parseInt(adress?.split("+").pop().replace("0x", ""), 16)
        }
        index = adress?.split("+")[1]
        adress = adress?.split("+")[0]
    }

    if (/^(bp|bx|sp)$/i.test(adress)
        || /^(si|di)$/i.test(adress)
        || /^(bp|bx)\+(si|di)$/i.test(_adress)
        || /^(bp|bx)\+(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)
        || /^(bp|bx)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)
        || /^(si|di)\+0x[0-9a-fA-F]{0,4}$/.test(_adress)) {
        if (/^(ax|bx|cx|dx|tx)$/i.test(register)) {
            obj.push(
                parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0),

                register.slice(0, -1) + 'l',

                parseInt(stack[adress], 16) + 1 + displacement + (parseInt(stack[index], 16) || 0),

                register.slice(0, -1) + 'h',

                register,

                memory[parseInt(stack[adress], 16) + 1 + displacement + (parseInt(stack[index], 16) || 0)] + memory[parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0)])
            if (instant) {
                stack[obj[1]] = memory[obj[0]] || '00'
                stack[obj[3]] = memory[obj[2]] || '00'
                stack[obj[4]] = obj[5] || '0000'
            }

            // stack[register.slice(0, -1) + 'l'] = memory[parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0)] || '00'
            // stack[register.slice(0, -1) + 'h'] = memory[parseInt(stack[adress], 16) + 1 + displacement + (parseInt(stack[index], 16) || 0)] || '00'

            // stack[register] =  || '0000'
        }
        else if (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(register)) {
            obj.push(parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0), register)

            if (instant) {
                stack[obj[1]] = memory[obj[0]] || '00'
                stack[obj[1].slice(0, -1) + 'x'] = stack[obj[1].slice(0, -1) + 'h'] + stack[obj[1].slice(0, -1) + 'l'];

            }
            // stack[register] = memory[parseInt(stack[adress], 16) + displacement + (parseInt(stack[index], 16) || 0)] || '0000'
            // stack[register] = memory[parseInt(stack[adress], 16) + 1 + displacement] + memory[parseInt(stack[adress], 16) + displacement]
        }
        else {
            console.error("compilation error");
        }
    }
    run()
    return obj
}

function pop(command) {
    command = command.replace(/^pop /i, "");
    mov('mov ' + 'sp' + ',' + '0x' + (parseInt(stack['sp'], 16) - 1).toString(16))
    mov('mov ' + command + ',' + '[sp]')
    mov('mov ' + 'sp' + ',' + '0x' + (parseInt(stack['sp'], 16) - 1).toString(16))
}

function push(command) {
    command = command.replace(/^push /i, "");
    mov('mov ' + '[sp+0x01]' + ',' + command)
    mov('mov ' + 'sp' + ',' + '0x' + (parseInt(stack['sp'], 16) + 2).toString(16))
}


function xchg(command) {
    command = command.replace(/^xchg /i, "");
    let values = command?.split(",").map(i => i.trim());
    if (values?.includes("")) {
        console.error("compilation error");
    } else {
        if ((/^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(values[0]) && /^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(values[1]))
            || (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(values[0]) && /^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(values[1]))) {
            let temp = stack[values[0]]
            stack[values[0]] = stack[values[1]]
            stack[values[1]] = temp
            values.forEach(value => {
                if (/^(ax|bx|cx|dx|tx)$/i.test(value)) {
                    stack[value.slice(0, -1) + 'h'] = stack[value].substring(0, 2).padStart(2, 0);
                    stack[value.slice(0, -1) + 'l'] = stack[value].slice(-2).padStart(2, 0);

                }
            })
        } else if ((/^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(values[0]) && testBazowe(values[1]))
            || (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(values[0]) && testBazowe(values[1]))
            || (/^(ax|bx|cx|dx|bp|di|si|sp|tx)$/i.test(values[1]) && testBazowe(values[0]))
            || (/^(ah|al|bh|bl|ch|cl|dh|dl|tl|th)$/i.test(values[1]) && testBazowe(values[0]))
        ) {
            if (testBazowe(values[1]) || testBazowe(values[0])) {
                let b = testBazowe(values[1])
                let a = testBazowe(values[0])
                let obj
                if (b) {
                    mov('mov ' + 'tx' + ',' + values[1])
                    mov('mov ' + values[1] + ',' + values[0])
                    xchg('xchg ' + values[0] + ',' + 'tx')
                }
                if (a) {
                    mov('mov ' + 'tx' + ',' + values[0])
                    mov('mov ' + values[0] + ',' + values[1])
                    xchg('xchg ' + values[1] + ',' + 'tx')

                }



            }
        }
        else {
            console.error("compilation error");

        }

        run()
    }
}


parseTerminal();


function dumpMemory(memory) {
    $().w2destroy('grid');
    $('#mem').w2grid({
        name: 'grid',
        columns: [
            { field: 'mem' },
            { field: 'address' },

        ],
    });


    generate(memory.length);


    function generate(num) {
        w2ui.grid.records = [];
        for (let i = 0; i < memory.length / 2; i++) {
            w2ui['grid'].records.push({
                mem: memory[i],
                address: i.toString(16).padStart(4, 0)
                // mem: memory.slice(i, i + 16).map((a, ix) => `<span id=${ix}>${a}</span>`).join(" ")
            });
        }
        w2ui.grid.buffered = w2ui.grid.records.length;
        w2ui.grid.total = w2ui.grid.buffered
        w2ui.grid.refresh();
    }



    // let table = document.getElementById("memory");
    // for (let i = 0; i < memory.length - 16; i += 16) {
    //     let row = table.insertRow();
    //     let cell = row.insertCell();
    //     cell.innerHTML = memory.slice(i, i + 16).map((a, ix) => `<span id=${ix}>${a}</span>`).join(" ");
    //     let cell = row.insertCell();
    //     cell.innerHTML = `${i.toString(16).padStart(4, 0)}:${(i + 16).toString(16).padStart(4, 0)}`;
    // }

}


function mov(command) {

    command = command.replace(/^mov /i, "");
    let values = command?.split(",").map(i => i.trim());

    if (values?.includes("")) {
        console.error("compilation error");
    } else {
        //mov ax, ...
        if (testWord(values, 0)) {
            // mov ax,bx
            if (testWord(values, 1)) {
                setValue(values[0], values[1])
            }

            // mov ax, 74dF
            else if (testHex(values[1])) {
                setValue(values[0], values[1])
            }

            else if (testBazowe(values[1])) {
                let obj = readBaseMemory(values[0], values[1])

            }

            else {
                console.error("compilation error");

            }

        } else if (testBazowe(values[0])) {
            let obj = setBaseMemory(values[0], values[1])

        }
        else {
            console.error("compilation error");
        }
    }
}

