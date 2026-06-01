extends Node

var version: = "Beta 0.D.6"
var antislide_warning = false
var newuser = 1
var tier = 0
var packet_tiles = []
var collabtype = -1
var collabmode = true
var collab_ip = ""
var hideui = false
var showplayers = false
var searchobjects = null
var hardmode = false
signal scene(path_to_scene)
signal scene_instant(path_to_scene)
signal notify(text)
signal host_notify(text)
signal death_notify(text)
signal infobox(text, buttons, id)
signal infobox_input(id, value)
signal disable_bgm()
signal editor_bgm()
signal level_bgm()
signal show_load()
signal hide_load()
signal enter_water()
signal exit_water()
signal update_mp_players()
signal update_room_settings()
signal mp_message(data)
signal tp_to_level(id)
signal death_link()
signal chat_message(message, user)
signal checkpoint_reset()
signal trigger(id)
var mp = 0
var chatting = false
var spectating = -1
var mplevel = -9999
var platform = ""

var classicmode = false
var news = [2, 2]
var moderator = 0
var moderator_check = false
var versionheader: = ""
var paused: = false
var start_time
var leftmenu = false
var my_dyes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var my_hats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var my_expressions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var pinned_levels: = []
var pinned_worlds: = []
var pinned_objects: = []
var favorites: = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}
var difficulties: = ["Chill", "Easy", "Medium", "Hard", "Tough", "Cruel", "Aquatic", "Volcanic", "Galactic", "Cheese", "Troll"]
var settings: = {}
var settingsnew: = {}
var storydata: = {}
var storydatanew: = {}
var mobile: = false
var betamode = false
var prize = 0
var localpath = ""
var soundlist = {
    0: "stone_new", 
    1: "wood", 
    2: "grass", 
    3: "metal", 
    4: "cloth", 
    5: "dirt", 
    6: "pop"
}
var tilenames: = []
var tilesounds: = [0, 0, 0, 1, 3, 2, 1, 6, 0, 0, 1, 3, 0, 0, 0, 6, 6, 3, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1, 1, 5, 3, 3, 3, 3, 0, 3, 0, 4, 6, 3, 1, 6, 6, 0, 1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 6, 0, 6, 2, 2, 0, 2, 6, 1, 1, 1, 0, 1, 0, 3, 3, 1, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var firstload: = false
var cached_shading = []
var cached_lighting = []


var server: = "https://barfysadventure.nfshost.com"
var character = 0

var backup_number = 0
var disableupload = false
var accountinfo = {
    "id": 0, 
    "discordID": "", 
    "username": "", 
    "token": ""
    }

var saved_search_params: = {

}
var saved_page = 0
var saved_world_menu = false

var stats = {
    "gravity": [650.0 * 0.01666666666667, 800.0 * 0.01666666666667, 650.0 * 0.01666666666667], 
    "speed": [200.0, 170.0, 200.0], 
    "jump": [-290.0, -290.0, 0.0], 
    "hp": [4, 5, 3], 
    "damagespeed": [3.0, 1.0, 1.0], 
    "balloffset": [0.0, 10.0, 0.0], 
    "winoffset": [Vector2(5.5, -9), Vector2(0.5, -15), Vector2(0.0, -7.5)]
}

var editorsettings: = false
var editorsettings2: = false
var toolsettings: = false
var artboard: = false
var practicepoints: = false
var slime: = false
var tool_settings_data: = {
    "brush_size": 0, 
    "continuous": 1, 
    "grass": 0, 
    "randomselection": 0, 
    "ignore_variant": 0, 
    "ignore_rotation": 0, 
    "stamp_mode": 0
}
var cheats: = {
    "speedhack": 0, 
    "disabletimer": 0, 
    "ignoredamage": 0
}
var editorhelp: = false
var editorsearch: = false
var objectlayers = {}
var tilemapcategories = {}
var enginespeeds = [1, 2, 4, 8]
var rotatable = []
var variations = []
var autotiles = ["0", "20", "21", "34", "42", "55", "60", "76", "122", "123", "125", "135", "149", "156", "157", "178", "212", "214", "219", "221"]
var autotilesint = []
var shadedtiles = [0, 20, 21, 34, 42, 55, 60, 76, 123, 125, 135, 149, 67, 94, 156, 157]
var rotations = [
(0), 
(0 | TileSetAtlasSource.TRANSFORM_TRANSPOSE | TileSetAtlasSource.TRANSFORM_FLIP_H), 
(0 | TileSetAtlasSource.TRANSFORM_FLIP_V | TileSetAtlasSource.TRANSFORM_FLIP_H), 
(0 | TileSetAtlasSource.TRANSFORM_TRANSPOSE | TileSetAtlasSource.TRANSFORM_FLIP_V), 
]
var diagonals: = {
    6: 150, 
    163: 164, 
    167: 168, 
    142: 201, 
    144: 202, 
    147: 206, 
    148: 207, 
    146: 208, 
    193: 209, 
    194: 210, 
    83: 218, 
}
var diagonals_reverse: = {

}
var icon_exceptions: = {
    51: 0, 
    85: 1, 
    89: 2, 
    80: 3, 
    143: 4, 
    37: 5, 
    70: 6, 
    61: 7, 
    55: 8, 
    10: 9, 
    184: 10, 
    59: 11, 
    2: 12, 
    79: 13, 
    135: 14, 
    12: 15, 
    115: 16, 
    112: 17, 
    77: 18, 
    219: 19, 
    17: 20, 
    224: 21, 
    230: 22, 
    231: 23, 
}
var group_exceptions: = {
    0: [0, 20, 21, 34, 42, 60, 76, 212]
    , 123: [123, 156, 157]
}
var rotate_exceptions: = {
    8: 15
    , 9: 15
    , 29: 15
    , 81: 15
    , 124: 15
    , 126: 15
    , 216: 15
    , 217: 15
    , 127: 2
    , 227: 16
    , 231: 4
}
var chisel_tiles: = [8, 9, 29, 81, 124, 126, 216, 217]
var classic_variants: = {
    2: 1, 
    16: 2, 
    40: 2, 
    41: 1, 
}

var colornames = ["Red", "Orange", "Yellow", "Green", "Teal", "Blue", "Purple", "Pink", "Silver"]
var hidden_tiles = [14, 15, 25, 30, 38, 32, 39, 58, 52, 53, 49, 69, 74, 86, 88, 98, 100, 105, 107, 139, 152, 153, 154, 155, 166, 122, 191, 192, 177, 176, 172, 173, 200, 221, 233]
var oldcolors = [0, 2, 3, 4, 5, 7, 8, 6]



var betafeatures = [116, 151]
var uploadbypass = false
var tileselected = {
    "TileMap": 0, 
    "Decoration": -1, 
    "Wall": -1, 
    "Camera": -1, 
    "Camera2": -1, 
    "Camera3": -1, 
    "Camera4": -1, 
    "CameraOffset": -1, 
    "Key": -1, 
    "Engine": -1, 
    "Guide": -1
}

var realism = false
var verified = false
var creatortime = 0.0
var color = 0
var rotation = 0
var preview = 0
var tool = "pencil"
var quickspawn = true
var quickspawncoords = Vector2i(0, 0)
var editorcamerapos = Vector2(0, 0)
var editorcamerazoom = Vector2(4.0, 4.0)
var editorcategory = "Terrain"
var playing_story_level: = false
var change_to_worldmap: = false
var worldmap = false
var worldmap_pos = Vector2(-60, -10)
var worldmap_theme = 1
var cutscene = 1
var play_level_cutscene = false
var player_trail = []
var practice_point_editor: = false
var practice_point_replace_id: = 0
var practice_point_editor_title: = ""
var place_editor: = false
var camtrail: = false
var freemove: = false
var editorscript = ""

var tags = {
    "s": "Standard", 
    "l": "Time Limit", 
    "p": "Puzzle", 
    "c": "Collectathon", 
    "1": "1 HP", 
    "t": "Technical", 
    "o": "Barfbot", 
    "u": "Cubey", 
    "a": "Art", 
    "j": "Rooms", 
    "b": "Break Time", 
    "d": "Dodgeballs", 
    "v": "Balloons", 
    "h": "Short Challenge", 
    "e": "Vertical", 
    "i": "Series", 
    "f": "Autoscroll", 
    "0": "Auto", 
    "k": "Precise", 
    "2": "Beep Block", 
    "3": "Collab", 
    "4": "Megacollab", 
    "5": "Antigravity", 
    "6": "Minigame", 
    "7": "Slop", 
    "8": "Screenwrap", 
    "9": "Story Edit", 
    "z": "Bicolor", 
    "q": "Engines", 
    "y": "Rewind Jam"
}

var badgedata = {
    0: "moderator", 
    1: "completed world 1", 
    2: "completed world 2", 
    11: "musician", 
    12: "Song Maker Plus", 
    14: "particpated in a level jam", 
    15: "Tier 1 supporter", 
    16: "Tier 2 supporter", 
    50: "completed chilly event", 
    101: "100%ed World 1"
}
var profilebgs = {
    0: ["None", ""]
    , 1: ["What Chamber 1", ""]
    , 2: ["What Chamber 2", ""]
    , 3: ["Who's Pyramid", ""]
    , 4: ["Groundbreaking", ""]
    , 5: ["Jump, Fall, Bounce!", ""]
    , 6: ["Dash Destroyer", ""]
    , 7: ["Meet Wooey", ""]
    , 8: ["Going Up", ""]
    , 9: ["Intruder Alert", ""]
    , 10: ["Operation ON-OFF", ""]
    , 11: ["Amethyst Tunnel", ""]
    , 12: ["Dash Constructor", ""]
    , 13: ["pingWrap", ""]
    , 14: ["What Chamber 3", ""]
    , 15: ["Hurry Up", ""]
    , 16: ["Barfbot...", ""]
    , 17: ["Going Down", ""]
    , 18: ["Jump-start Jungle", ""]
    , 19: ["Target Practice", ""]
    , 20: ["🍄🍄🍄🍄🍄🍄", ""]
    , 21: ["Stored Away", ""]
    , 22: ["10 Sleepy Seconds", ""]
    , 23: ["Hurry Up", ""]
    , 24: ["Amethyst Hollow", ""]
    , 25: ["On the Bubble", ""]
    , 26: ["Teletoken Skies", ""]
    , 200: ["The Delivery", ""]
    , 1000: ["1000", ""]
    , 1001: ["Tourmaline Temple", ""]
    , 1002: ["Nexus", ""]
    , 1003: ["Distant Memories", ""]
}
var hats = {
    0: {"name": "Original", "creator": []}
    , 1: {"name": "Party Hat", "creator": []}
    , 2: {"name": "Blue Cap", "creator": []}
    , 3: {"name": "Chef Hat", "creator": []}
    , 4: {"name": "Shades", "creator": []}
    , 5: {"name": "Cat Ears", "creator": []}
    , 6: {"name": "(Not Clickbait)", "creator": []}
    , 7: {"name": "Halo", "creator": []}
    , 8: {"name": "Who are You Plush", "creator": []}
    , 9: {"name": "Alert!", "creator": []}
    , 10: {"name": "Wooey Plush", "creator": []}
    , 11: {"name": "Bollar Stack", "creator": []}
    , 12: {"name": "Stem", "creator": []}
    , 13: {"name": "Pencil", "creator": []}
    , 14: {"name": "Crown", "creator": []}
    , 15: {"name": "Cubey Plush", "creator": []}
    , 16: {"name": "Dave's Super Hat", "creator": []}
    , 17: {"name": "Johnathan's Super Hat", "creator": []}
    , 18: {"name": "Portrait", "creator": []}
    , 19: {"name": "Top Hat", "creator": []}
    , 20: {"name": "Gift", "creator": []}
    , 21: {"name": "Problem? Mask", "creator": []}
    , 22: {"name": "Magnifying Glass", "creator": []}
    , 23: {"name": "Denied", "creator": []}
    , 24: {"name": "Play Button", "creator": []}
    , 25: {"name": "Heart", "creator": []}
    , 26: {"name": "Hopping Beanie", "creator": []}
    , 27: {"name": "Bunny Ears", "creator": []}
    , 28: {"name": "Pinned", "creator": []}
    , 29: {"name": "Witch Hat", "creator": []}
    , 30: {"name": "Biggify", "creator": []}
    , 31: {"name": "Pet Rock", "creator": []}
    , 32: {"name": "Purple Fedora", "creator": []}
    , 33: {"name": "Yolk", "creator": []}
    , 34: {"name": "Liquify Plush", "creator": []}
    , 35: {"name": "Clown Wig", "creator": []}
    , 36: {"name": "Ravin' Red Top Hat", "creator": [0, "visegrips22"]}
    , 37: {"name": "Salakot", "creator": [0, "saltyfilipinobottle"]}
    , 38: {"name": "Acacia Tree", "creator": [0, "acacacia"]}
    , 39: {"name": "~ Switch", "creator": [0, "mixprogram"]}
    , 40: {"name": "Car", "creator": [0, "saltyfilipinobottle"]}
    , 41: {"name": "Santa's Hat", "creator": []}
    , 42: {"name": "Fuse ", "creator": [0, "funglebomb, saltyfilipinobottle"]}
    , 43: {"name": "Tinpot", "creator": [0, "worra, saltyfilipinobottle, mixprogram"]}
    , 44: {"name": "Sushi", "creator": [0, "acacacia"]}
    , 45: {"name": "Skewb", "creator": [0, "acacacia"]}
    , 46: {"name": "SilliFlower!", "creator": [0, "mixprogram"]}
    , 47: {"name": "Propeller Hat", "creator": [0, "saltyfilipinobottle"]}
    , 48: {"name": "Planning Headset", "creator": [0, "triplea, saltyfilipinobottle"]}
    , 49: {"name": "Plunger", "creator": [0, "mushroomfungus"]}


}
var dyes = {
    0: {"name": "Original", "overlay": 0, "scroll": Vector2(0, 0)}
    , 1: {"name": "Ablaze", "overlay": 0, "scroll": Vector2(0, 0)}
    , 2: {"name": "Frost", "overlay": 0, "scroll": Vector2(0, 0)}
    , 3: {"name": "2018", "overlay": 0, "scroll": Vector2(0, 0)}
    , 4: {"name": "Monochrome", "overlay": 0, "scroll": Vector2(0, 0)}
    , 5: {"name": "Bubblegum", "overlay": 0, "scroll": Vector2(0, 0)}
    , 6: {"name": "Sandstone", "overlay": 0, "scroll": Vector2(0, 0)}
    , 7: {"name": "Rainbow", "overlay": 0, "scroll": Vector2(0, 0)}
    , 8: {"name": "Outline", "overlay": 0, "scroll": Vector2(0, 0)}
    , 9: {"name": "Painted", "overlay": 0, "scroll": Vector2(0, 0)}
    , 10: {"name": "erutnevdA s'yfraB", "overlay": 0, "scroll": Vector2(0, 0)}
    , 11: {"name": "Blood", "overlay": 0, "scroll": Vector2(0, 0)}
    , 12: {"name": "Cubey", "overlay": 0, "scroll": Vector2(0, 0)}
    , 13: {"name": "Healium", "overlay": 0, "scroll": Vector2(0, 0)}
    , 14: {"name": "Wooey", "overlay": 0, "scroll": Vector2(0, 0)}
    , 15: {"name": "Pumpkin", "overlay": 0, "scroll": Vector2(0, 0)}
    , 16: {"name": "Apple", "overlay": 0, "scroll": Vector2(0, 0)}
    , 17: {"name": "G Hurler", "overlay": 0, "scroll": Vector2(0, 0)}
    , 18: {"name": "Desert Gradient", "overlay": 1, "scroll": Vector2(0, 0.1)}
    , 19: {"name": "Barfy", "overlay": 0, "scroll": Vector2(0, 0)}
    , 20: {"name": "Barfbot", "overlay": 0, "scroll": Vector2(0, 0)}
    , 21: {"name": "Grape", "overlay": 0, "scroll": Vector2(0, 0)}
    , 22: {"name": "2019", "overlay": 0, "scroll": Vector2(0, 0)}
    , 23: {"name": "Banana", "overlay": 0, "scroll": Vector2(0, 0)}
    , 24: {"name": "(Not Clickbait)", "overlay": 0, "scroll": Vector2(0, 0)}
    , 25: {"name": "Strange", "overlay": 0, "scroll": Vector2(0, 0)}
    , 26: {"name": "Vintage", "overlay": 0, "scroll": Vector2(0, 0)}
    , 27: {"name": "Flat", "overlay": 0, "scroll": Vector2(0, 0)}
    , 28: {"name": "Sticker", "overlay": 0, "scroll": Vector2(0, 0)}
    , 29: {"name": "Black Sticker", "overlay": 0, "scroll": Vector2(0, 0)}
    , 30: {"name": "Rainbow Outline", "overlay": 0, "scroll": Vector2(0, 0)}
    , 31: {"name": "8-bit", "overlay": 0, "scroll": Vector2(0, 0)}
    , 32: {"name": "Constellation", "overlay": 1, "scroll": Vector2(0.05, 0.05)}
    , 33: {"name": "Midnight", "overlay": 0, "scroll": Vector2(0, 0)}
    , 34: {"name": "Magma", "overlay": 1, "scroll": Vector2(-0.05, -0.05)}
    , 35: {"name": "Aqua", "overlay": 1, "scroll": Vector2(-0.05, -0.025)}
    , 36: {"name": "Acid", "overlay": 1, "scroll": Vector2(-0.07, 0.05)}
    , 37: {"name": "Tornado", "overlay": 1, "scroll": Vector2(0.3, 0)}
    , 38: {"name": "Gear", "overlay": 0, "scroll": Vector2(0, 0)}
    , 39: {"name": "Snow", "overlay": 1, "scroll": Vector2(0.03, -0.2)}
    , 40: {"name": "Missing", "overlay": 1, "scroll": Vector2(0.05, 0.05)}
    , 41: {"name": "Earth", "overlay": 1, "scroll": Vector2(0.07, 0.02)}
    , 42: {"name": "Gold", "overlay": 1, "scroll": Vector2(0.05, 0.02)}
    , 43: {"name": "Diamond", "overlay": 1, "scroll": Vector2(0.05, 0.02)}
    , 44: {"name": "Love", "overlay": 1, "scroll": Vector2(-0.04, -0.04)}
    , 45: {"name": "Ghost", "overlay": 0, "scroll": Vector2(0, 0)}
    , 46: {"name": "Bricks", "overlay": 1, "scroll": Vector2(-0.04, -0.04)}
    , 47: {"name": "Emerald", "overlay": 1, "scroll": Vector2(0.05, 0.02)}
    , 48: {"name": "Mushroom", "overlay": 1, "scroll": Vector2(0.05, -0.05)}
    , 49: {"name": "Palette", "overlay": 0, "scroll": Vector2(0.0, 0.0)}
    , 50: {"name": "Supporter", "overlay": 1, "scroll": Vector2(0.05, 0.05)}
    , 51: {"name": "Liquify", "overlay": 1, "scroll": Vector2(0.12, 0.0)}
}
var expressions: = {
    0: {"name": "None", "char": -1}
    , 1: {"name": "Boredfy", "char": 0}
    , 2: {"name": "Overwhelmingly Positive", "char": 0}
    , 3: {"name": "Faceless", "char": -1}
    , 4: {"name": "Happy Barfbot", "char": 1}
    , 5: {"name": ":(", "char": 1}
    , 6: {"name": "Upside-down", "char": 2}
    , 7: {"name": "Cardboard Box", "char": 2}
    , 8: {"name": "Shades", "char": -1}
    , 9: {"name": "Snowman", "char": -1}
    , 10: {"name": ":3", "char": -1}

}
var stickers: = {
    -1:
        {
            "name": "Barfy", 
            "desc": "Barfy enjoys building things and showing them to Barfbot, his robot \"assistant\".\n\nHe also loves eating dodgeballs, and barfing them at others.", 
            "sprite": "res://assets/character/barfy/sticker.png"
        }, 
    -2:
        {
            "name": "What am I", 
            "desc": "The What am I's are an extraterrestrial species that collects robots, machines, and equipment. They are named after their iconic catchphrase.\n\nTip: You can dash or fastfall through What am I's to avoid taking damage.", 
            "sprite": "res://assets/enemy/whatamiicon2.png"
        }, 
    -3:
        {
            "name": "Who are You", 
            "desc": "The Who are You's are usually rivals of the What am I's. However, this time they're teaming up to steal gears.\n\nTip: Fastfall onto Who are You's to bounce higher.", 
            "sprite": "res://assets/enemy/whoareyouicon.png"
        }, 
    -4:
        {
            "name": "Dodgeballs", 
            "desc": "Barfy's favorite food, toy, weapon, currency, and more!\n\nAfter collecting a dodgeball, press \"Up\" to spit it out. If you have a dodgeball prepared, you can jump in mid-air, launching the dodgeball beneath you.", 
            "sprite": "res://assets/tiles/ball.png"
        }, 
    -10001:
        {
            "name": "Spring", 
            "desc": "Need a boost? Fastfall onto springs to jump higher!", 
            "sprite": "res://assets/tiles/springicon.png"
        }, 
    -10002:
        {
            "name": "Healium Can", 
            "desc": "Barfy's favorite energy drink! (Barfbot tolerates it)\n\nCollect cans of Healium to gain 1 HP each.\n\nFun Fact: Coral Crops are the primary ingredient in Healium.", 
            "sprite": "res://assets/tiles/healium.png"
        }, 
    -20001:
        {
            "name": "Wooey", 
            "desc": "Wooey is a pink worm snake thing... and the leader of the What am I's!", 
            "sprite": "res://assets/enemy/wooey/sticker.png"
        }, 
    -30001:
        {
            "name": "Dashpipe", 
            "desc": "Let's a go! Dashpipes are a fast mode of transportation. Dash into one end to go out the other.", 
            "sprite": "res://assets/tiles/curvedpipeicon.png"
        }, 
    -5:
        {
            "name": "Barfbot", 
            "desc": "Barfbot is a grumpy robot built by Barfy, who he hates due to a bug in his code.\n\nHe's not as fast as Barfy, but he has higher wall jumps, and isn't slowed down while taking damage.", 
            "sprite": "res://assets/character/barfbot/sticker.png"
        }, 
    -6:
        {
            "name": "Toggle Token", 
            "desc": "Press a toggle token to change the state of its corresponding color.", 
            "sprite": "res://assets/tiles/toggleorbicon.png"
        }, 
    -7:
        {
            "name": "Opticone", 
            "desc": "Opticones are mechanical ice cream cones that shoot lasers below them. They can be killed by jumping on/dashing through them.", 
            "sprite": "res://assets/enemy/opticoneicon.png"
        }, 
    -20002:
        {
            "name": "Liquify", 
            "desc": "Liquify once started as a tiny drop, but grew in size over the span of hundreds of years.\n\nFun Fact: Every gallon of Liquify equates to one victim...", 
            "sprite": "res://assets/tiles/redliquid/sticker.png"
        }, 



}

var emojis = {
    0: "None", 
    1: "Heart", 
    2: "Tada", 
    3: "Trophy", 
    4: "Warning", 
    7: "Fire", 
    8: "Question Mark", 
    19: "Cheese", 
    20: "Wooey", 
    5: "What am I", 
    6: "Who are you", 
    9: "Troll", 
    22: "Barfy", 
    21: "Cubey", 
    23: "Barfbot", 
    10: "Chill", 
    11: "Easy", 
    12: "Medium", 
    13: "Hard", 
    14: "Tough", 
    15: "Cruel", 
    16: "Aquatic", 
    17: "Volcanic", 
    18: "Galactic", 




}



var colors = {0: {"color": "171021", "name": ""}, 1: {"color": "ffffff", "name": ""}, 2: {"color": "5c596a", "name": ""}, 3: {"color": "88849c", "name": ""}, 4: {"color": "c0beca", "name": ""}, 5: {"color": "662639", "name": ""}, 6: {"color": "9f2f50", "name": ""}, 7: {"color": "d54053", "name": ""}, 8: {"color": "e77c66", "name": ""}, 9: {"color": "8e4533", "name": ""}, 10: {"color": "be6739", "name": ""}, 11: {"color": "e39a52", "name": ""}, 12: {"color": "f1cf6d", "name": ""}, 13: {"color": "27453b", "name": ""}, 14: {"color": "3a6658", "name": ""}, 15: {"color": "499c62", "name": ""}, 16: {"color": "80d276", "name": ""}, 17: {"color": "1e4248", "name": ""}, 18: {"color": "2d626a", "name": ""}, 19: {"color": "418887", "name": ""}, 20: {"color": "52c39e", "name": ""}, 21: {"color": "3e3962", "name": ""}, 22: {"color": "5c5591", "name": ""}, 23: {"color": "7686bc", "name": ""}, 24: {"color": "9bc8dc", "name": ""}, 25: {"color": "42234f", "name": ""}, 26: {"color": "4e2c60", "name": ""}, 27: {"color": "753b8f", "name": ""}, 28: {"color": "9f48b9", "name": ""}, 29: {"color": "792a57", "name": ""}, 30: {"color": "b13d83", "name": ""}, 31: {"color": "e165a1", "name": ""}, 32: {"color": "ff92ba", "name": ""}, 33: {"color": "8d3334", "name": ""}, 34: {"color": "bd4641", "name": ""}, 35: {"color": "e46948", "name": ""}, 36: {"color": "f2985f", "name": ""}, 37: {"color": "371617", "name": ""}, 38: {"color": "481f17", "name": ""}, 39: {"color": "5e2e1e", "name": ""}, 40: {"color": "794027", "name": ""}, 41: {"color": "a15d36", "name": ""}, 42: {"color": "d68957", "name": ""}, 43: {"color": "faad79", "name": ""}, 44: {"color": "2b5a53", "name": ""}, 45: {"color": "388256", "name": ""}, 46: {"color": "52b439", "name": ""}, 47: {"color": "99e550", "name": ""}, 48: {"color": "7ef687", "name": ""}, 49: {"color": "201e3a", "name": ""}, 50: {"color": "2b3253", "name": ""}, 51: {"color": "807e99", "name": ""}, 52: {"color": "bac0dd", "name": ""}, 53: {"color": "e9ecf3", "name": ""}, 54: {"color": "f16c33", "name": ""}, 55: {"color": "ffb639", "name": ""}, 56: {"color": "322c62", "name": ""}, 57: {"color": "4b4291", "name": ""}, 58: {"color": "6075bc", "name": ""}, 59: {"color": "63d0ff", "name": ""}, 60: {"color": "ef72a0", "name": ""}, 61: {"color": "423c4f", "name": ""}, 62: {"color": "ff0000", "name": ""}}

var current_playing_song = "accelerate"
var currentdoor = ""
var doorsettings = false

var defaultdoordata = {
    "title": ""
    , "name": ""
    , "bgm": "accelerate"
    , "bg": 0
    , "voidBottom": 0
    , "voidTop": 0
    , "voidBottomLevel": 0
    , "voidTopLevel": -20
    , "time": 0
    , "autoTime": 0
    , 
}
var leveldata = {
    "title": "level"
    , "description": ""
    , "song": 0
    , "TileMap": ""
    , "Decoration": ""
    , "Wall": ""
    , "Camera": ""
    , "Camera2": ""
    , "Camera3": ""
    , "Camera4": ""
    , "CameraOffset": ""
    , "Key": ""
    , "thumbnail": ""
    , "tags": ""
    , "bgm": "accelerate"
    , "defaultCharacter": 0
    , "defaultHP": 4
    , "defaultGravity": 1
    , "defaultClaySpeed": 1
    , "bg": 0
    , "voidBottom": 0
    , "voidTop": 0
    , "voidBottomLevel": 0
    , "voidTopLevel": -20
    , "practicePoints": [["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"], ["Point", 0, 1, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0], 3.7, -1, "default"]]
    , "doors": {}
    , "time": 0
    , "autoTime": 0
    , "levelVersion": 1
    , "version": ""
    , "artboard": ""
    , "gearShardAmount": 0
    , "engineLayers": [[1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0]]
}
var defaultlevelcode: = "{\n\"title\":\"level\"\n,\"description\":\"\"\n,\"song\":0\n,\"TileMap\":\"\"\n,\"Decoration\":\"\"\n,\"Wall\":\"\"\n,\"Camera\":\"\"\n,\"Camera2\":\"\"\n,\"Camera3\":\"\"\n,\"Camera4\":\"\"\n,\"CameraOffset\":\"\"\n,\"Key\":\"\"\n,\"Engine\":\"\"\n,\"Guide\":\"\"\n,\"thumbnail\":\"\"\n,\"tags\":\"\"\n,\"bgm\":\"accelerate\"\n,\"defaultCharacter\":0\n,\"defaultHP\":4\n,\"defaultGravity\":1\n,\"defaultClaySpeed\":1\n,\"bg\":0\n,\"voidBottom\":0\n,\"voidTop\":0\n,\"voidBottomLevel\":0\n,\"voidTopLevel\":-20\n,\"practicePoints\":[[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"],[\"Point\",0,1,4,[0,0,0,0,0,0,0,0,0],3.7,-1,\"default\"]]\n,\"doors\":{}\n,\"time\":0\n,\"autoTime\":0\n,\"levelVersion\":1\n,\"version\":\"\"\n,\"artboard\":\"\"\n,\"gearShardAmount\":0\n,\"engineLayers\":[[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0],[1,0,0,0,0,0]]\n}"




































var playing_online_level: = false
var levelinfo: = {}
var online_pb = 0.0
var online_level_id: = 0
var story_level_id: = 0
var levelcode = ""
var cameramode: = 0
var cameralockpos: = Vector2(0, 0)
var recording: = true
var ghostname = ""
var playing: = false
var racing: = true
var ghostsound: = false
var multighost: = false
var ghostdata: = ""
var ghostversion = 1
var practice_mode = false
var practice_point = 0
var debug_mode = false
var artboardcache: ImageTexture



var replay: = {

}
var editor_replay: = {

}

var ghost_replays = []
var ghost_usernames = []
var ghost_dyes = []
var ghost_hats = []
var ghost_expressions = []
var ghost_messages = []
var ghost_emojis = []
var hint = {}
var songcredits: = {
    "accelerate": "thebarfyshow", 
    "confusion2": "thebarfyshow", 
    "chilly": "thebarfyshow", 
    "chilly2": "thebarfyshow", 
    "noname": "blokos", 
    "conundrum": "Schmeeberson", 
    "phenomena": "thebarfyshow", 
    "breaktime": "thebarfyshow", 
    "wooey": "FoxManFilms", 
    "consider": "blokos", 
    "prodigy": "FoxManFilms", 
    "cosmos": "Schmeeberson", 
    "organic": "thebarfyshow", 
    "dreaming": "thebarfyshow", 
    "fracture": "Schmeeberson", 
    "liquify": "thebarfyshow", 
    "vegetate": "thebarfyshow", 
    "overload": "Schmeeberson", 
    "sandy": "Schmeeberson", 
    "suffocate": "thebarfyshow", 
    "inaccurate": "blokos", 
    "scorched": "FoxManFilms", 
    "bedtime": "thebarfyshow", 
    "identity": "FoxManFilms", 
    "complex": "Alex!", 
    "warp": "Alex!", 
    "no_song": "idk", 
}

var maxbgs = 0
var bgalts: = {
    3: [3, 17], 
    5: [5, 40, 46], 
    0: [0, 33, 34, 35], 
    1: [1, 30, 31, 32], 
    24: [24, 26, 41], 
    10: [10, 36, 37, 39], 
    28: [28, 38], 
    27: [27, 42, 43]
}
var bginfo: = {
    0: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    1: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    2: {"creator": "thebarfyshow", "tint": 1, "hidden": 0}, 
    3: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    4: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    5: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    6: {"creator": "blokos", "tint": 0, "hidden": 0}, 
    7: {"creator": "neula", "tint": 2, "hidden": 0}, 
    8: {"creator": "neula", "tint": 0, "hidden": 0}, 
    9: {"creator": "neula", "tint": 0, "hidden": 0}, 
    10: {"creator": "thebarfyshow", "tint": 2, "hidden": 0}, 
    36: {"creator": "thebarfyshow", "tint": 2, "hidden": 1}, 
    39: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    37: {"creator": "thebarfyshow", "tint": 2, "hidden": 1}, 
    11: {"creator": "Aurora", "tint": 0, "hidden": 0}, 
    12: {"creator": "neula", "tint": 0, "hidden": 0}, 
    13: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    14: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    15: {"creator": "thebarfyshow", "tint": 1, "hidden": 0}, 
    16: {"creator": "Aurora", "tint": 0, "hidden": 0}, 
    17: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    18: {"creator": "neula", "tint": 0, "hidden": 0}, 
    19: {"creator": "neula", "tint": 0, "hidden": 0}, 
    20: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    21: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    22: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    23: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    24: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    25: {"creator": "thebarfyshow", "tint": 1, "hidden": 0}, 
    26: {"creator": "thebarfyshow", "tint": 1, "hidden": 1}, 
    27: {"creator": "thebarfyshow", "tint": 1, "hidden": 0}, 
    28: {"creator": "thebarfyshow", "tint": 0, "hidden": 0}, 
    38: {"creator": "thebarfyshow", "tint": 1, "hidden": 1}, 
    29: {"creator": "thebarfyshow", "tint": 2, "hidden": 0}, 
    30: {"creator": "thebarfyshow", "tint": 1, "hidden": 1}, 
    31: {"creator": "thebarfyshow", "tint": 2, "hidden": 1}, 
    32: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    33: {"creator": "thebarfyshow", "tint": 1, "hidden": 1}, 
    34: {"creator": "thebarfyshow", "tint": 2, "hidden": 1}, 
    35: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    40: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    41: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    42: {"creator": "thebarfyshow", "tint": 1, "hidden": 1}, 
    43: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
    44: {"creator": "blokos", "tint": 0, "hidden": 0}, 
    45: {"creator": "blokos", "tint": 0, "hidden": 0}, 
    46: {"creator": "thebarfyshow", "tint": 0, "hidden": 1}, 
}

var bgeffects: = {
    10: {"scroll": Vector2(0.1, 0.1)}, 
    18: {"scroll": Vector2(-0.1, 0)}, 
    36: {"scroll": Vector2(0.1, 0.1)}, 
    39: {"scroll": Vector2(0.1, 0.1)}, 
    37: {"scroll": Vector2(0.1, 0.1)}, 
    17: {"scroll": Vector2(0.1, 0), "overlay_scroll": Vector2(0.0, -2), "fog": Color("#828282c0")}, 
    40: {"overlay_scroll": Vector2(0.0, -2), "fog": Color("#828282c0")}, 
    41: {"overlay_scroll": Vector2(0.0, -2), "fog": Color("#828282c0")}, 
    23: {"scroll": Vector2(0.1, -0.6), "overlay_scroll": Vector2(0.2, -0.8), "fog": Color("#d6d6d6c5")}, 
    46: {"overlay_scroll": Vector2(0.2, -0.8), "overlay3_scroll": Vector2(0.1, -0.6), "fog": Color("#d6d6d6c5")}, 
    24: {"overlay_scroll": Vector2(0.05, -0.2)}, 
    26: {"overlay_scroll": Vector2(0.05, -0.2)}, 
    28: {"parallax": 1, "fog": Color("#6b588c6c")}, 
    38: {"parallax": 1, "fog": Color("#89565F6c")}, 
    29: {"parallax": 1, "fog": Color("#488c438e")}, 
    15: {"fog": Color("#89565F6c")}, 
    27: {"overlay2": 1, "scroll": Vector2(-0.1, 0)}, 
    42: {"overlay2": 1}, 
    43: {"overlay2": 1, "scroll": Vector2(-0.1, 0)}, 
}
var code = 0
var open_date = ""
var showinginfobox = false
var storylevels = {
    -1: {
        "location": Vector2i(22, 7), 
        "name": "What Chamber 1", 
        "path": "1_1", 
        "type": "main", 
        "difficulty": 1, 
        "thumbnail": 1, 
        "icon": "res://assets/icons/ground.png", 
        "icon_offset": 0, 
        "world": 1, 
    }, 
    -2: {
        "location": Vector2i(17, 10), 
        "name": "What Chamber 2", 
        "path": "1_2", 
        "type": "main", 
        "difficulty": 2, 
        "thumbnail": 2, 
        "icon": "res://assets/enemy/whatamiicon2.png", 
        "icon_offset": 0, 
        "world": 1, 
    }, 
    -3: {
        "location": Vector2i(12, 2), 
        "name": "Who's Pyramid", 
        "path": "1_3", 
        "type": "main", 
        "difficulty": 2, 
        "thumbnail": 3, 
        "icon": "res://assets/enemy/whoareyouicon.png", 
        "icon_offset": 0, 
        "world": 1, 
    }, 
    -4: {
        "location": Vector2i(12, -8), 
        "name": "Groundbreaking", 
        "path": "1_4", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 4, 
        "icon": "res://assets/tiles/ball.png", 
        "icon_offset": -1, 
        "world": 1, 
    }, 
    -10001: {
        "location": Vector2i(18, 2), 
        "name": "Jump, Fall, Bounce!", 
        "path": "bt1", 
        "type": "bt", 
        "difficulty": 1, 
        "thumbnail": 5, 
        "icon": "res://assets/tiles/springicon.png", 
        "icon_offset": -1, 
        "world": 1, 
    }, 
    -10002: {
        "location": Vector2i(22, -11), 
        "name": "Dash Destroyer", 
        "path": "bt2", 
        "type": "bt", 
        "difficulty": 1, 
        "thumbnail": 6, 
        "icon": "res://assets/tiles/dashgate.png", 
        "icon_offset": 15, 
        "world": 1, 
    }, 
    -20001: {
        "location": Vector2i(26, -8), 
        "name": "Meet Wooey", 
        "path": "wooey", 
        "type": "boss", 
        "difficulty": 3, 
        "thumbnail": 7, 
        "icon": "res://assets/hat/icons/10.png", 
        "icon_offset": -1, 
        "world": 1, 
    }, 
    -30001: {
        "location": Vector2i(29, -8), 
        "name": "Going Up", 
        "path": "t1", 
        "type": "bt", 
        "difficulty": 2, 
        "thumbnail": 8, 
        "icon": "res://assets/ui/pixelicons/up.png", 
        "icon_offset": 0, 
        "world": 1, 
    }, 
    -5: {
        "location": Vector2i(29, -43), 
        "name": "Intruder Alert", 
        "path": "2_1", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 9, 
        "icon": "res://assets/tiles/orb/1.png", 
        "icon_offset": 0, 
        "world": 2, 
    }, 
    -6: {
        "location": Vector2i(47, -43), 
        "name": "Operation ON-OFF", 
        "path": "2_2", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 10, 
        "icon": "res://assets/tiles/onblockicon.png", 
        "icon_offset": 0, 
        "world": 2, 
    }, 
    -10003: {
        "location": Vector2i(38, -48), 
        "name": "Dash Constructor", 
        "path": "bt3", 
        "type": "bt", 
        "difficulty": 1, 
        "thumbnail": 12, 
        "icon": "res://assets/tiles/dashspringicon.png", 
        "icon_offset": -1, 
        "world": 2, 
    }, 
    -100007: {
        "location": Vector2i(56, -35), 
        "name": "Amethyst Tunnel", 
        "path": "2_3n", 
        "type": "main", 
        "difficulty": 2, 
        "thumbnail": 11, 
        "icon": "res://assets/enemy/opticoneicon.png", 
        "icon_offset": -1, 
        "world": 2, 
    }, 
    -7: {
        "location": Vector2i(56, -35), 
        "name": "Amethyst Hollow", 
        "path": "2_3", 
        "type": "secret", 
        "difficulty": 3, 
        "thumbnail": 24, 
        "icon": "res://assets/enemy/opticoneicon.png", 
        "icon_offset": -1, 
        "world": 2, 
    }, 
    -10004: {
        "location": Vector2i(68, -35), 
        "name": "Hurry Up!", 
        "path": "bt4", 
        "type": "bt", 
        "difficulty": 0, 
        "thumbnail": 23, 
        "icon": "res://assets/tiles/conveyoricon.png", 
        "icon_offset": 0, 
        "world": 2, 
    }, 
    -8: {
        "location": Vector2i(68, -45), 
        "name": "pingWrap", 
        "path": "2_4", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 13, 
        "icon": "res://assets/tiles/camerawrap.png", 
        "icon_offset": 0, 
        "world": 2, 
    }, 
    -40001: {
        "location": Vector2i(-6, 10), 
        "name": "What Chamber 3", 
        "path": "1_s", 
        "type": "secret", 
        "difficulty": 3, 
        "thumbnail": 14, 
        "icon": "res://assets/enemy/boulder/bouldericon.png", 
        "icon_offset": -1, 
        "world": 1, 
    }, 
    -40002: {
        "location": Vector2i(-600, 10), 
        "name": "10 Sleepy Seconds", 
        "path": "2_s", 
        "type": "secret", 
        "difficulty": 5, 
        "thumbnail": 22, 
        "icon": "res://assets/enemy/zeteor/zeteoricon.png", 
        "icon_offset": -1, 
        "world": 2, 
    }, 
    -99999: {
        "location": Vector2i(22, 5), 
        "name": "Cutscene", 
        "path": "1", 
        "type": "cutscene", 
        "cutscene_id": 1, 
        "difficulty": 0, 
        "thumbnail": 200, 
        "icon": "", 
        "icon_offset": 0, 
        "world": 1, 
    }, 
    -999991: {
        "location": Vector2i(29, -37), 
        "name": "Cutscene", 
        "path": "2", 
        "type": "cutscene", 
        "cutscene_id": 2, 
        "difficulty": 0, 
        "thumbnail": 16, 
        "icon": "", 
        "icon_offset": 0, 
        "world": 2, 
    }, 
    -999992: {
        "location": Vector2i(79, -13), 
        "name": "Cutscene", 
        "path": "3", 
        "type": "cutscene", 
        "cutscene_id": 3, 
        "difficulty": 0, 
        "thumbnail": 16, 
        "icon": "", 
        "icon_offset": 0, 
        "world": 3, 
    }, 
    -20002: {
        "location": Vector2i(79, -45), 
        "name": "Going Down", 
        "path": "liquify", 
        "type": "boss", 
        "difficulty": 4, 
        "thumbnail": 17, 
        "icon": "res://assets/hat/icons/34.png", 
        "icon_offset": -1, 
        "world": 2, 
    }, 
    -9: {
        "location": Vector2i(91, -13), 
        "name": "Jump-start Jungle", 
        "path": "3_1n", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 18, 
        "icon": "res://assets/tiles/balloonicon.png", 
        "icon_offset": -1, 
        "world": 3, 
    }, 
    -10: {
        "location": Vector2i(91, 3), 
        "name": "🍄🍄🍄🍄🍄🍄", 
        "path": "3_2", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 20, 
        "icon": "res://assets/tiles/mushroomicon.png", 
        "icon_offset": 0, 
        "world": 3, 
    }, 
    -10005: {
        "location": Vector2i(91, -5), 
        "name": "Target Practice", 
        "path": "bt5", 
        "type": "bt", 
        "difficulty": 2, 
        "thumbnail": 19, 
        "icon": "res://assets/tiles/targeticon.png", 
        "icon_offset": -1, 
        "world": 3, 
    }, 
    -10006: {
        "location": Vector2i(91, -5), 
        "name": "Teletoken Skies", 
        "path": "bt6", 
        "type": "bt", 
        "difficulty": 2, 
        "thumbnail": 26, 
        "icon": "res://assets/tiles/teletokenicon.png", 
        "icon_offset": -1, 
        "world": 3, 
    }, 
    -11: {
        "location": Vector2i(73, 3), 
        "name": "Stored Away", 
        "path": "3_3", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 21, 
        "icon": "res://assets/tiles/clockicon.png", 
        "icon_offset": 0, 
        "world": 3, 
    }, 
    -12: {
        "location": Vector2i(73, 3), 
        "name": "On the Bubble", 
        "path": "3_4", 
        "type": "main", 
        "difficulty": 3, 
        "thumbnail": 25, 
        "icon": "res://assets/tiles/diagonalbubblearrow.png", 
        "icon_offset": -1, 
        "world": 3, 
    }, 


}

var key_exceptions: = {
    "Comma": ","
    , "Period": "."
    , "BracketLeft": "["
    , "BracketRight": "]"
    , "Semicolon": ";"
    , "Apostrophe": "'"
    , "Slash": "/"
    , "Backslash": "\\"
    , "QuoteLeft": "Backtick"
    , "Equal": "="
    , "Minus": "-"
}




func _ready():
    if FileAccess.file_exists("user://testzone.txt"):
        server = "https://barfysadventuretest.nfshost.com"
    maxbgs = bginfo.size() - 1
    var tilefile = FileAccess.open("res://assets/tileinfo.json", FileAccess.READ)
    var tiledata = JSON.parse_string(tilefile.get_as_text())
    tilenames = tiledata["tilenames"]
    for i in tiledata["rotatable"]:
        rotatable.append(int(i))
    for i in tiledata["variants"]:
        variations.append(int(i))
    for l in tiledata["layers"]:
        objectlayers[l] = []
        for i in tiledata["layers"][l]:
            objectlayers[l].append(int(i))
    for l in tiledata["categories"]:
        tilemapcategories[l] = []
        for i in tiledata["categories"][l]:
            tilemapcategories[l].append(int(i))

    for i in diagonals:
        diagonals_reverse[diagonals[i]] = i
    for i in {
            "editor_left": 65
            , "editor_right": 65
            , "editor_up": 65
            , "editor_down": 65
            , "editor_play": 65
            , "editor_settings": 65
            , "editor_pencil": 65
            , "editor_fill": 65
            , "editor_rectangle": 65
            , "editor_select": 65
            , "editor_stamp": 65
            , "editor_color": 65
            , "editor_rotate": 65
            , "editor_eyedrop": 65
            , "editor_quickrect": 65
            , "editor_search": 65
            , "editor_ghost": 65
            , "editor_thumbnail": 65
    }:
        var key = InputEventKey.new()
        key.physical_keycode = KEY_F35
        InputMap.add_action(i)
        InputMap.action_add_event(i, key)
    DisplayServer.window_set_title("Barfy's Adventure")
    randomize()
    if randi_range(0, 60) == 5:
        tilenames[136] = ["Big Ol' Red One", "Big Ol' Red Ones"]
        tilenames[135] = "Big Ol' Red One"
    code = randi_range(0, 9999999)
    open_date = Time.get_datetime_string_from_system(true)
    var arrow = load("res://assets/ui/cursor.png")
    var beam = load("res://assets/ui/cursor_ibeam.png")

    Input.set_custom_mouse_cursor(arrow)
    Input.set_custom_mouse_cursor(beam, Input.CURSOR_IBEAM)

    for i in autotiles:
        autotilesint.append(int(i))
    if OS.get_name() != "Web":

        var b = load("res://discord_manager.tscn").instantiate()
        add_child(b)

    platform = OS.get_name()
    start_time = int(Time.get_unix_time_from_system())
    versionheader = str("X-BA-Version: ", version)
    var fileversionsave = FileAccess.open("user://version.txt", FileAccess.WRITE)
    fileversionsave.store_string(version)



    if OS.has_feature("web_android") or OS.has_feature("web_ios"):
        mobile = true
    if OS.get_name() == "Android":
        mobile = true

    if FileAccess.file_exists("user://dyes.save"):
        var dyesfile = FileAccess.open("user://dyes.save", FileAccess.READ)
        my_dyes = dyesfile.get_var()
    else:
        my_dyes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    if FileAccess.file_exists("user://tier.save"):
        var tierfile = FileAccess.open("user://tier.save", FileAccess.READ)
        tier = tierfile.get_var()
    else:
        tier = 0

    if FileAccess.file_exists("user://expressions.save"):
        var expressionsfile = FileAccess.open("user://expressions.save", FileAccess.READ)
        my_expressions = expressionsfile.get_var()
    else:
        my_expressions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


    if FileAccess.file_exists("user://hats.save"):
        var hatsfile = FileAccess.open("user://hats.save", FileAccess.READ)
        my_hats = hatsfile.get_var()
    else:
        my_hats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    if FileAccess.file_exists("user://level_pins.save"):
        var levelpinsfile = FileAccess.open("user://level_pins.save", FileAccess.READ)
        pinned_levels = levelpinsfile.get_var()
    else:
        pinned_levels = []

    if FileAccess.file_exists("user://world_pins.save"):
        var worldpinsfile = FileAccess.open("user://world_pins.save", FileAccess.READ)
        pinned_worlds = worldpinsfile.get_var()
    else:
        pinned_worlds = []

    if FileAccess.file_exists("user://object_pins.save"):
        var objectpinsfile = FileAccess.open("user://object_pins.save", FileAccess.READ)
        pinned_objects = objectpinsfile.get_var()
    else:
        pinned_objects = []

    if FileAccess.file_exists("user://favorites.save"):
        var favoritesfile = FileAccess.open("user://favorites.save", FileAccess.READ)
        favorites = favoritesfile.get_var()
    else:
        favorites = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []}


    if FileAccess.file_exists("user://account.save"):
        var file = FileAccess.open("user://account.save", FileAccess.READ)
        accountinfo = file.get_var()
    else:
        accountinfo = {
        "id": 0, 
        "discordID": "", 
        "username": "", 
        "token": ""
        }




    levelcode = defaultlevelcode
    var path = "user://levels/"
    var _error = DirAccess.make_dir_recursive_absolute(path)
    path = "user://structures/"
    _error = DirAccess.make_dir_recursive_absolute(path)
    path = "user://pfps/"
    _error = DirAccess.make_dir_recursive_absolute(path)





    if FileAccess.file_exists("user://story.txt"):
        storydata = {
            "-1": 0, 
            "-2": 0, 
            "-3": 0, 
            "-4": 0, 
            "-10001": 0, 
            "-10002": 0, 
            "-20001": 0, 
            "-20002": 0, 
            "-30001": 0, 
            "-40001": 0, 
            "-40002": 0, 
            "-100007": 0, 
            "-5": 0, 
            "-6": 0, 
            "-7": 0, 
            "-8": 0, 
            "-9": 0, 
            "-10": 0, 
            "-11": 0, 
            "-12": 0, 
            "-10005": 0, 
            "-10006": 0, 
            "-10003": 0, 
            "-10004": 0, 
        }
        var file = FileAccess.open("user://story.txt", FileAccess.READ)
        storydatanew = JSON.parse_string(file.get_as_text())
        storydata.merge(storydatanew, true)

    else:
        storydata = {
            "-1": 0, 
            "-2": 0, 
            "-3": 0, 
            "-4": 0, 
            "-10001": 0, 
            "-10002": 0, 
            "-20001": 0, 
            "-20002": 0, 
            "-30001": 0, 
            "-40001": 0, 
            "-40002": 0, 
            "-100007": 0, 
            "-5": 0, 
            "-6": 0, 
            "-7": 0, 
            "-8": 0, 
            "-9": 0, 
            "-10": 0, 
            "-11": 0, 
            "-12": 0, 
            "-10005": 0, 
            "-10006": 0, 
            "-10003": 0, 
            "-10004": 0, 
        }



    if FileAccess.file_exists("user://settings.txt"):
        newuser = 0
        settings = {
        "character": 0, 
        "bgm": 1.0, 
        "sfx": 1.0, 
        "voicelines": 1.0, 
        "editormusic": 1, 
        "autosave": 10, 
        "timer": 1, 
        "master": 1.0, 
        "fullscreen": 0, 
        "togglerun": 0, 
        "tts": 0, 
        "captions": 0, 
        "effects": 0, 
        "fpscounter": 0, 
        "maxfps": 29, 
        "interpolation": 0, 
        "disablelaunchermusic": 0, 
        "leftmenu": 0, 
        "allowreset": 0, 
        "funny": 0, 
        "fastui": 0, 
        "shake": 0, 
        "keybinds": {
        "left": 65, 
        "right": 68, 
        "up": 87, 
        "down": 83, 
        "dash": 74, 
        "jump": 75, 
        "restart": 4194308, 
        "leftalt": null, 
        "rightalt": null, 
        "upalt": null, 
        "downalt": null, 
        "runalt": null, 
        "jumpalt": null, 
        "restartalt": null, 
        }, 
         "editorkeybinds": {
        "editor_color": 67, 
        "editor_down": 83, 
        "editor_eyedrop": 4194328, 
        "editor_fill": 71, 
        "editor_ghost": 39, 
        "editor_left": 65, 
        "editor_pencil": 66, 
        "editor_play": 4194309, 
        "editor_quickrect": 4194306, 
        "editor_rectangle": 85, 
        "editor_right": 68, 
        "editor_rotate": 82, 
        "editor_search": 81, 
        "editor_select": 77, 
        "editor_settings": 96, 
        "editor_stamp": 80, 
        "editor_thumbnail": 84, 
        "editor_up": 87
      }, 
        "titlemusic": 0, 
        "rpc": 1, 
        "ldm": 0, 
        "colorblind": 0, 
        "disableshake": 0, 
        "code": "", 
        "sstnames": 0, 
        "transparentghosts": 1, 
        "ghostsound": 0, 
        "searchmode": 0, 
        "opaquessdeco": 0, 
        "exitwarning": 1, 
        "groupsize": 25, 
        }
        var file = FileAccess.open("user://settings.txt", FileAccess.READ)
        settingsnew = JSON.parse_string(file.get_as_text())
        settings.merge(settingsnew, true)
    elif FileAccess.file_exists("settings.txt"):

        var file = FileAccess.open("settings.txt", FileAccess.READ)
        settingsnew = JSON.parse_string(file.get_as_text())
        settings.merge(settingsnew, true)
        var filesave = FileAccess.open("user://settings.txt", FileAccess.WRITE)
        filesave.store_string(JSON.stringify(settings))
    else:
        settings = {
        "character": 0, 
        "bgm": 1.0, 
        "sfx": 1.0, 
        "voicelines": 1.0, 
        "editormusic": 1, 
        "autosave": 15, 
        "timer": 1, 
        "master": 1.0, 
        "fullscreen": 0, 
        "togglerun": 0, 
        "tts": 0, 
        "captions": 0, 
        "effects": 0, 
        "fpscounter": 0, 
        "interpolation": 0, 
        "maxfps": 29, 
        "disablelaunchermusic": 0, 
        "leftmenu": 0, 
        "allowreset": 0, 
        "funny": 0, 
        "fastui": 0, 
        "shake": 0, 
        "keybinds": {
        "left": 65, 
        "right": 68, 
        "up": 87, 
        "down": 83, 
        "dash": 74, 
        "jump": 75, 
        "restart": 4194308
        }, 
         "editorkeybinds": {
        "editor_color": 67, 
        "editor_down": 83, 
        "editor_eyedrop": 4194328, 
        "editor_fill": 71, 
        "editor_ghost": 39, 
        "editor_left": 65, 
        "editor_pencil": 66, 
        "editor_play": 4194309, 
        "editor_quickrect": 4194306, 
        "editor_rectangle": 85, 
        "editor_right": 68, 
        "editor_rotate": 82, 
        "editor_search": 81, 
        "editor_select": 77, 
        "editor_settings": 96, 
        "editor_stamp": 80, 
        "editor_thumbnail": 84, 
        "editor_up": 87
      }, 
        "titlemusic": 0, 
        "rpc": 1, 
        "ldm": 0, 
        "colorblind": 0, 
        "disableshake": 0, 
        "code": "", 
        "hideghostnames": 0, 
        "transparentghosts": 1, 
        "ghostsound": 0, 
        "searchmode": 0, 
        "opaquessdeco": 0, 
        "exitwarning": 1, 
        "groupsize": 25, 
        }
    var key_event = InputEventKey.new()
    for i in settings["keybinds"]:
        if !"controller" in i:
            key_event = InputEventKey.new()
            key_event.keycode = settings["keybinds"][i]

            InputMap.action_erase_events(i)
            InputMap.action_add_event(i, key_event)

    key_event = InputEventKey.new()
    key_event.keycode = settings["keybinds"]["left"]
    InputMap.action_add_event("ui_left", key_event)
    key_event = InputEventKey.new()
    key_event.keycode = settings["keybinds"]["right"]
    InputMap.action_add_event("ui_right", key_event)
    key_event = InputEventKey.new()
    key_event.keycode = settings["keybinds"]["up"]
    InputMap.action_add_event("ui_up", key_event)
    key_event = InputEventKey.new()
    key_event.keycode = settings["keybinds"]["down"]
    InputMap.action_add_event("ui_down", key_event)

    if Engine.time_scale != 1.0 or OS.has_feature("movie"):
        disableupload = true
        server = ""
        accountinfo = {
        "id": 0, 
        "discordID": "", 
        "username": "", 
        "token": ""
        }
        version = ""

    for i in settings["editorkeybinds"]:
        key_event = InputEventKey.new()
        key_event.keycode = settings["editorkeybinds"][i]

        InputMap.action_erase_events(i)
        InputMap.action_add_event(i, key_event)
    key_event = InputEventKey.new()
    key_event.physical_keycode = KEY_EQUAL
    InputMap.add_action("zoom_in")
    InputMap.action_add_event("zoom_in", key_event)
    key_event = InputEventKey.new()
    key_event.physical_keycode = KEY_MINUS
    InputMap.add_action("zoom_out")
    InputMap.action_add_event("zoom_out", key_event)

    key_event = InputEventKey.new()
    key_event.physical_keycode = KEY_SLASH
    InputMap.add_action("chat")
    InputMap.action_add_event("chat", key_event)

func createsettingsfile():
    var file = FileAccess.open("user://settings.txt", FileAccess.WRITE)
    file.store_string(JSON.stringify(settings))

func creaatestoryfile():
    var file = FileAccess.open("user://story.txt", FileAccess.WRITE)
    file.store_string(JSON.stringify(storydata))


func discord_play():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_play()
func discord_editor():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_editor()

func discord_play_shards(amount, total, reset_time):
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_play_shards(amount, total, reset_time)

func discord_menu():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_menu()

func discord_cosmetics():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_cosmetics()

func discord_shop():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_shop()

func discord_news():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_news()

func discord_story():
    if OS.get_name() != "Web":
        if settings["rpc"] == 1:
            get_node("discord_manager").discord_story()


func get_key_name(key):

    var eb1: Array[InputEvent] = InputMap.action_get_events(str(key))
    var keyname = ""
    if !eb1.is_empty():
        keyname = eb1[0].as_text().replace(" (Physical)", "")
    if key_exceptions.has(keyname):
        keyname = key_exceptions[keyname]
    return (keyname)

func sha_256(str: String) -> String:
    return str.sha256_text()

func validate_username(username):

    var final_text = ""
    var max_length = 20
    var regex = RegEx.new()
    regex.compile("[a-z0-9_.]")
    var text_input = username.to_lower()
    var regex_match = regex.search_all(text_input)
    if regex_match:
        for i in range(0, regex_match.size()):
            final_text += regex_match[i].get_string()
            if final_text.length() >= max_length:
                final_text = final_text.substr(0, max_length)
                break
    return (final_text)
