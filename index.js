var Recall, match;

match = function(a, b) {
  return (a.high === b.high) && (a.low === b.low);
};

module.exports = Recall = (function() {
  function Recall(dispatch) {
    var id, party;
    party = {};
    id = {
      high: 0,
      low: 0
    };
    dispatch.hook('S_LOGIN', 4, function(data) {
      id = data.cid;
    });
    dispatch.hook('S_EACH_SKILL_RESULT', 3, function(data) {
      if (!match(data.target, id)) {
        dispatch.toClient('S_EACH_SKILL_RESULT', 3, {
          source: id,
		  owner: id,
          target: data.target,
          model: 10101,
          skill: 10100 + 0x4000000,
          stage: 0,
          unk1: 0,
          id: 0,
          time: 0,
          damage: data.damage,
          type: 1,
          type2: 4
          });
      }
    });
    dispatch.hook('S_PARTY_MEMBER_LIST', 5, function(data) {
      var i, len, member, name, ref;
      party = {};
      ref = data.members;
      for (i = 0, len = ref.length; i < len; i++) {
        member = ref[i];
        if (party[name = member.cID.high] == null) {
          party[name] = {};
        }
        party[member.cID.high][member.cID.low] = 1;
      }
    });
    dispatch.hook('S_EACH_SKILL_RESULT', 3, function(data) {
      var noct, ref;
      if (((ref = party[data.source.high]) != null ? ref[data.source.low] : void 0) != null) {
        if (data.type === 1) {
          noct = +match(data.source, id);
          data.source = id;
          data.type2 = (data.type2 & ~4) | (noct << 2);
        }
      }
      return true;
    });
  }

  return Recall;

})();
