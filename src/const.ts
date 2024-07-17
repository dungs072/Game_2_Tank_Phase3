let CONST = {
    GAME: {
        MAX_WIDTH: 1000,

        MAX_HEIGHT: 800,
    },
    PLAYER: {
        ROTATION_BARREL_SPEED: 5,
        ROTATION_SPEED: 2.5,
        MOVEMENT_SPEED: 200,
        BARREL_RADIUS: 100,

        EVENTS: {
            PLAYER_DIE: 'PLAYER_DIE',
        },
    },
    ENEMEY: {
        SHOOT_PER_TIME: 2000,
    },
    UI: {
        EVENTS: {
            HEALTH_BAR_CHANGE: 'changehealthbar',
        },
    },
}
export default CONST
