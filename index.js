const Command = require('command');
module.exports = function DamageSpy(dispatch) {
    //Change these to toggle features on/off on startup
    let flags = {
        dps: false,
        heal: false,
        me: false
    };
    let pcid,
        players = {};
    const command = Command(dispatch);

    dispatch.hook('S_LOGIN', 4, (event) => {
        pcid = event.cid;
    });
    dispatch.hook('S_SPAWN_USER', 3, (event) => {
        players[event.cid] = event;
    });

    dispatch.hook('S_DESPAWN_USER', 2, (event) => {
        delete players[event.target];
    });
    //Commands
    command.add('spy', (cmd, t1, t2) => {

        if (cmd === "dps") {
            flags.dps = !flags.dps;
            command.message(`DPS Spying: ${flags.dps}`);
        }
        if (cmd === "me") {
            flags.me = !flags.me;
            command.message(`Showing all damage: ${flags.me}`);
        }
        if (cmd === "heal") {
            flags.heal = !flags.heal;
            command.message(`Healer Spying: ${flags.heal}`);
        }
    });
    //Do stuff
    dispatch.hook('S_EACH_SKILL_RESULT', 3, (event) => {
        if (flags.dps) {
            if (event.source.equals(pcid) || event.owner.equals(pcid)) {
                event.type2 = 0;
                return true;
            }
            if (players[event.source] || players[event.owner]) {
                dispatch.toClient('S_EACH_SKILL_RESULT', 3, {
                    source: pcid,
                    owner: pcid,
                    target: event.target,
                    model: 10101,
                    skill: 10100 + 0x4000000,
                    stage: 0,
                    unk1: 0,
                    id: 0,
                    time: 0,
                    damage: event.damage,
                    type: 1,
                    type2: 1,
                    crit: event.crit
                });
            }
        }
        if (flags.me) {
            if (event.source.equals(pcid) || event.owner.equals(pcid)) {
                dispatch.toClient('S_EACH_SKILL_RESULT', 3, {
                    source: pcid,
                    owner: pcid,
                    target: event.target,
                    model: event.model,
                    skill: event.damage,
                    stage: event.stage,
                    unk1: event.unk1,
                    id: event.id,
                    time: event.time,
                    damage: event.damage,
                    type: event.type,
                    type2: event.type,
                    crit: event.crit,
                    blocked: 0,
                    setTargetAction: event.setTargetAction
                });
            }
        }
        if (flags.heal) {
            if ((!event.source.equals(pcid) || (!event.owner.equals(pcid) && event.owner > 0)) && !event.target.equals(pcid) && event.type === 2) {
                dispatch.toClient('S_EACH_SKILL_RESULT', 3, {
                    source: pcid,
                    owner: pcid,
                    target: event.target,
                    model: 10101,
                    skill: 10100 + 0x4000000,
                    stage: 0,
                    unk1: 0,
                    id: 0,
                    time: 0,
                    damage: event.damage,
                    type: 3,
                    type2: 1,
                    crit: event.crit
                });
            };
        }

    });
};
