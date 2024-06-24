class Movement extends Phaser.Scene {

    curve;
    path;

    constructor() {
        super("Movement");
        this.my = {sprite: {}, text: {}};  // Create an object to hold sprite bindings
        this.keys = {};

        this.my.sprite.bullet = [];
        this.maxBullets = 1;

        this.my.sprite.enemies = [];

        this.score = 0;
        this.kills = 0;

        this.frame = 0;

        this.chargeStart = 0;
        this.chargeTime = 0;
        this.reloadTime = 31;
        this.fireTime = 0;

        this.wave1 = false;
        this.wave2 = false;
        this.wave3 = false;
        this.waveBuffer = 0;

    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from Kenny Assets pack "Monster Builder Pack"
        // https://kenney.nl/assets/monster-builder-pack
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.atlasXML("spaceOneParts", "sheet.png", "sheet.xml");
        this.load.atlasXML("spaceTwoParts", "spaceShooter2_spritesheet.png", "spaceShooter2_spritesheet.xml");
        this.load.image("background", "blue.png");

        this.load.audio("smallLaser", "laserSmall_002.ogg");
        this.load.audio("chargeLaser", "laserRetro_001.ogg");
        this.load.audio("boom", "explosionCrunch_000.ogg");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        this.points = [
            20, 50,
            400, 200,
            450, 150,
            400, 100,
            350, 150,
            400, 200,
            780, 50
        ];
        this.points2 = [
            20, 50,
            300, 200,
            350, 150,
            300, 100,
            250, 150,
            300, 200,
            780, 50
        ];
        this.points3 = [
            780, 50,
            500, 200,
            450, 150,
            500, 100,
            550, 150,
            500, 200,
            20, 50
        ];
        this.points4 = [
            50, 50,
            350, 50,
        ];
        this.points5 = [
            750, 50,
            450, 50,
        ];
        
        this.curve = new Phaser.Curves.Spline(this.points);
        this.curve2 = new Phaser.Curves.Spline(this.points2);
        this.curve3 = new Phaser.Curves.Spline(this.points3);
        this.curve4 = new Phaser.Curves.Spline(this.points4);
        this.curve5 = new Phaser.Curves.Spline(this.points5);

        this.add.image(400, 300, "background").setScale(3.1, 2.4);


        my.sprite.body = this.add.sprite(game.config.width/2, game.config.height - 40, "spaceTwoParts", "spaceShips_006.png");
        my.sprite.body.setScale(0.5);

        my.sprite.release = this.add.sprite(game.config.width/2 + 20, game.config.height - 70, "spaceOneParts", "powerupBlue_bolt.png");
        my.sprite.release.visible = false;
        my.sprite.release.setScale(0.5);

        my.sprite.charge = this.add.sprite(game.config.width/2, game.config.height - 330, "spaceOneParts", "laserBlue14.png");
        my.sprite.charge.visible = false;
        my.sprite.charge.setScale(2, 8.5);


        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 15;
        this.bulletSpeed = 30;
        
        my.text.score = this.add.bitmapText(540, 0, "rocketSquare", "Score " + this.score);

        this.add.text(10, 5, "Overcharge", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability

        if(this.keys.a.isDown){
            if(my.sprite.body.x >= 50){
                my.sprite.body.x -= this.playerSpeed;
                my.sprite.charge.x -= this.playerSpeed;
                my.sprite.release.x -= this.playerSpeed;
            }
        }

        if(this.keys.d.isDown){
            if(my.sprite.body.x <= 750){
                my.sprite.body.x += this.playerSpeed;
                my.sprite.charge.x += this.playerSpeed;
                my.sprite.release.x += this.playerSpeed;
            }
        }

        if(this.keys.space.isDown && this.reloadTime > 30){
            if(this.chargeTime == 0){
                this.chargeStart = this.frame;
                this.chargeTime++
            } else if(this.chargeTime <= 20){
                this.chargeTime++
            } else if(this.chargeTime > 20){
                //Damage Player
                this.chargeStart = 0;
                this.chargeTime = 0;
                this.reloadTime++;
                console.log("too late")
            }
        }

        if(this.keys.space.isUp && this.chargeTime != 0){
            if(this.chargeTime > 10){
                this.chargeStart = 0;
                this.chargeTime = 0;
                my.sprite.charge.visible = true;
                this.sound.play("chargeLaser", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                this.reloadTime = 0;
                this.fireTime++;
            } else {
                this.chargeStart = 0;
                this.chargeTime = 0;
                this.reloadTime = 0;
                if (my.sprite.bullet.length < this.maxBullets) {
                    my.sprite.bullet.push(this.add.sprite(
                        my.sprite.body.x, my.sprite.body.y-(my.sprite.body.displayHeight/2), "spaceTwoParts", "spaceEffects_007.png")
                    );
                    this.sound.play("smallLaser", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
                console.log("too soon")
            }
        }

        if(this.chargeTime > 10 && this.chargeTime <=20){
            my.sprite.release.visible = true;
        } else {
            my.sprite.release.visible = false;
        }

        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        if(this.fireTime > 0){
            if(this.fireTime == 9){
                this.fireTime = 0;
                my.sprite.charge.visible = false;
            } else {
                this.fireTime++;
            }
        }

        if(this.frame == 30){
            if(this.curve.points[0] != undefined){
                my.sprite.enemies.push(this.add.follower(this.curve, this.curve.points[0].x, this.curve.points[0].y, "spaceOneParts", "cockpitGreen_0.png"));
                for(let enemy of my.sprite.enemies){
                    enemy.setScale(0.5);
                    enemy.visible = true;
                    enemy.scorePoints = 100;
                    enemy.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 3000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: true,
                        rotationOffset: -90
                    })
                }
            }
        }

        if(this.kills == 1 && this.wave1 == false){
            if(this.waveBuffer == 10){
                this.wave1 = true;
                this.waveBuffer = 0;
                if(this.curve.points[0] != undefined){
                    my.sprite.enemies.push(this.add.follower(this.curve2, this.curve2.points[0].x, this.curve2.points[0].y, "spaceOneParts", "cockpitGreen_0.png"));
                    my.sprite.enemies.push(this.add.follower(this.curve3, this.curve3.points[0].x, this.curve3.points[0].y, "spaceOneParts", "cockpitGreen_0.png"));
                    for(let enemy of my.sprite.enemies){
                        enemy.setScale(0.5);
                        enemy.visible = true;
                        enemy.scorePoints = 100;
                        enemy.startFollow({
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration: 3000,
                            ease: 'Sine.easeInOut',
                            repeat: -1,
                            yoyo: true,
                            rotateToPath: true,
                            rotationOffset: -90
                        })
                    }
                }
            } else {
                this.waveBuffer++;
            }
        }

        if(this.kills == 3 && this.wave2 == false){
            if(this.waveBuffer == 10){
                this.wave2 = true;
                this.waveBuffer = 0;
                if(this.curve.points[0] != undefined){
                    my.sprite.enemies.push(this.add.follower(this.curve4, this.curve4.points[0].x, this.curve4.points[0].y, "spaceTwoParts", "spaceShips_007.png"));
                    my.sprite.enemies.push(this.add.follower(this.curve5, this.curve5.points[0].x, this.curve5.points[0].y, "spaceTwoParts", "spaceShips_007.png"));
                    for(let enemy of my.sprite.enemies){
                        enemy.setScale(0.5);
                        enemy.visible = true;
                        enemy.scorePoints = 200;
                        enemy.startFollow({
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration: 3000,
                            ease: 'Sine.easeInOut',
                            repeat: -1,
                            yoyo: true,
                            rotateToPath: false,
                            rotationOffset: -90
                        })
                    }
                }
            } else {
                this.waveBuffer++;
            }
        }

        if(this.kills == 5 && this.wave3 == false){
            if(this.waveBuffer == 10){
                this.wave3 = true;
                this.waveBuffer = 0;
                if(this.curve.points[0] != undefined){
                    my.sprite.enemies.push(this.add.follower(this.curve4, this.curve4.points[0].x, this.curve4.points[0].y, "spaceTwoParts", "spaceShips_007.png"));
                    my.sprite.enemies.push(this.add.follower(this.curve5, this.curve5.points[0].x, this.curve5.points[0].y, "spaceTwoParts", "spaceShips_007.png"));
                    my.sprite.enemies.push(this.add.follower(this.curve2, this.curve2.points[0].x, this.curve2.points[0].y, "spaceOneParts", "cockpitGreen_0.png"));
                    my.sprite.enemies.push(this.add.follower(this.curve3, this.curve3.points[0].x, this.curve3.points[0].y, "spaceOneParts", "cockpitGreen_0.png"));
                    for(let enemy of my.sprite.enemies){
                        enemy.setScale(0.5);
                        enemy.visible = true;
                        if(my.sprite.enemies.indexOf(enemy) < 2){
                            enemy.scorePoints = 200;
                            enemy.startFollow({
                                from: 0,
                                to: 1,
                                delay: 0,
                                duration: 3000,
                                ease: 'Sine.easeInOut',
                                repeat: -1,
                                yoyo: true,
                                rotateToPath: false,
                                rotationOffset: -90
                            })
                        } else {
                            enemy.scorePoints = 100;
                            enemy.startFollow({
                                from: 0,
                                to: 1,
                                delay: 0,
                                duration: 3000,
                                ease: 'Sine.easeInOut',
                                repeat: -1,
                                yoyo: true,
                                rotateToPath: true,
                                rotationOffset: -90
                            })
                        }
                    }

                }
            } else {
                this.waveBuffer++;
            }
        }

        for (let bullet of my.sprite.bullet) {
            for(let enemy of my.sprite.enemies){
                if (this.collides(enemy, bullet)) {
                    // clear out bullet -- put y offscreen, will get reaped next update
                    this.sound.play("boom", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    bullet.y = -100;
                    enemy.visible = false;
                    enemy.x = -100;
                    // Update score
                    this.score += enemy.scorePoints;
                    this.kills++;
                    this.updateScore();
                    let index = my.sprite.enemies.indexOf(enemy);
                    my.sprite.enemies.splice(index, 1);

                }
            }
        }
        
        for(let enemy of my.sprite.enemies){
            if (this.collides(enemy, my.sprite.charge)) {
                // clear out bullet -- put y offscreen, will get reaped next update
                this.sound.play("boom", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                enemy.visible = false;
                enemy.x = -100;
                // Update score
                this.score += enemy.scorePoints*2;
                this.kills++;
                this.updateScore();
                let index = my.sprite.enemies.indexOf(enemy);
                my.sprite.enemies.splice(index, 1);
            }
        }

        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }
        this.frame++;
        this.reloadTime++;
    }

    collides(a, b) {
        if(a.visible == false || b.visible == false) return false;
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.score);
    }

}