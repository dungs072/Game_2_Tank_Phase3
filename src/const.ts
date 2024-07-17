let CONST = {
    GAME: {
        MAX_WIDTH: 1000,

        MAX_HEIGHT: 1000,
    },
    PLAYER: {
        ROTATION_BARREL_SPEED: 2,
        ROTATION_SPEED: 1,
        MOVEMENT_SPEED: 100,
        BARREL_RADIUS: 100,
        RELOAD_TIME: 1000,

        EVENTS: {
            PLAYER_DIE: 'PLAYER_DIE',
        },
    },
    ENEMEY: {
        SHOOT_PER_TIME: 2000,
        EVENTS: {
            ENEMY_DIE: 'ENEMY_DIE',
        },
    },
    UI: {
        EVENTS: {
            HEALTH_BAR_CHANGE: 'changehealthbar',
        },
    },
    SCORE: {
        EVENTS: {
            SCORE_ADDED: 'scoreadded',
        },
        SCORE_ADDED_AMOUNT: 1,
    },
}
export default CONST
