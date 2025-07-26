SharkGame.FunFacts = {
    dilutedResources: ["shark", "ray", "crab", "fish"], // dilute these while not in starter to keep the fun facts fresher

    showFact() {
        log.addMessage(this.getFact());
    },

    getFact() {
        const pool = this.getPool();
        return SharkGame.choose(pool);
    },

    getPool() {
        const pool = [];
        const currentWorld = world.worldType;
        if (
            this.worldBased[currentWorld] &&
            (!this.worldBased[currentWorld].areRequirementsMet || this.worldBased[currentWorld].areRequirementsMet())
        ) {
            _.each(this.worldBased[currentWorld].messages, (fact) => {
                pool.push(sharktext.boldString("Fun fact: ") + `<i>${fact}</i>`);
            });
        }

        let anyAvailableResource = false;
        $.each(this.resourceBased, (resource, facts) => {
            // purposefully dilute some facts if we are not on the starter world
            // I want these facts to be more likely relevant than not
            if (world.doesResourceExist(resource) && res.getTotalResource(resource)) {
                anyAvailableResource = true;
                if (!this.dilutedResources.includes(resource) || currentWorld === "start" || Math.random() < 0.25) {
                    _.each(facts, (fact) => {
                        pool.push(
                            sharktext.boldString(
                                `${sharktext.getResourceName(
                                    resource,
                                    false,
                                    1,
                                    SharkGame.Log.isNextMessageEven()
                                        ? sharkcolor.getVariableColor("--color-dark")
                                        : sharkcolor.getVariableColor("--color-med"),
                                )} fact: `,
                            ) + `<i>${fact}</i>`,
                        );
                    });
                }
            }
        });

        if (anyAvailableResource) {
            // only 10% chance to include the 'default' facts
            // this is because those facts are seen all over the place
            // they would end up diluting the world-specific and resource-specific facts
            //
            // also acts as a failsafe in case there are no other facts to display
            if (Math.random() < 0.1 || pool.length === 0) {
                _.each(this.default, (fact) => {
                    pool.push(sharktext.boldString("Fun fact: ") + `<i>${fact}</i>`);
                });
            }
            return pool;
        } else {
            return ["Fun fact: <i>New fun facts are unlocked as you see new stuff. Keep playing to unlock some!</i>"];
        }
    },

    worldBased: {
        frigid: {
            messages: ["When water freezes, it expands a little bit. That's why full bottles of water break or explode when put in the freezer."],
        },
        volcanic: {
            messages: [
                "This world was originally called Violent, now it's Volcanic. Playtesters got confused and thought the world had violence, when really, it just has the threat of violence.",
                "Hydrothermal vents do not spew fire in real life. They spew smoke.",
                "Hydrothermal vents support a diverse array of sea life due to their high output of minerals. Bacteria eat these minerals, forming the base of a food chain.",
                "Hydrothermal vents are found at fault lines in the earth's crust, where water becomes superheated due to magma rising close to the ocean floor.",
            ],
            areRequirementsMet() {
                return SharkGame.Upgrades.purchased.includes("thermalVents");
            },
        },
        shrouded: {},
        abandoned: {
            messages: ["This world was the first one to be remade for New Frontiers."],
        },
        haven: {
            messages: ["Kelp paper is real. You cannot write on it though."],
            areRequirementsMet() {
                return SharkGame.Upgrades.purchased.includes("sunObservation");
            },
        },
        marine: {},
        tempestuous: {
            messages: ["'Tempestuous' does not mean stormy. It means emotionally turbulent. But it's close enough."],
        },
    },

    resourceBased: {
        // add fish facts at some point
        shark: [
            "There are many species of sharks that investigate things with their mouths. This can end badly for the subject of investigation.",
            "There have been social behaviours observed in lemon sharks, and evidence that suggests they prefer company to being alone.",
            "Some shark species display 'tonic immobility' when rubbed on the nose. They stop moving, appear deeply relaxed, and can stay this way for up to 15 minutes before swimming away.",
            "In some shark species eggs hatch within their mothers, and in some of these species the hatched babies eat unfertilised or even unhatched eggs.",
            "More people are killed by lightning every year than by sharks.",
            "White sharks have been observed to have a variety of body language signals to indicate submission and dominance towards each other without violence.",
            "A kiss from a shark can make you immortal. But only if they want you to be immortal.",
            "A shark is worth one in the bush, and a bunch in the sea water. Don't put sharks in bushes.",
            "Sharks are very old, evolutionarily speaking. The first sharks emerged some time around 400 million years ago.",
            "Sharks have very rough skin, like sandpaper. In fact, shark skin was literally used as sandpaper in the past.",
            "Sharks do not have bones. Neither do rays.",
        ],
    },

    default: [
        "Shark Game's initial bare minimum code came from an abandoned idle game about bees. Almost no trace of bees remains!",
        "The existence of resources that create resources that create resources in this game were inspired by Derivative Clicker!",
        "Kitten Game was an inspiration for this game! This surprises probably no one. The very first message the game gives you is a nod of sorts.",
        "There is a surprising deficit of cookie in this game.",
        "Remoras were banished from the oceans in the long bygone eras. The sharks hope they never come back.",
        "Fun facts will only talk about things you have already seen in-game.",
        "Fun facts have always been in the game's code, but have never been exposed until this system for displaying them was added.",
        "New Frontiers, this Shark Game mod, was inspired by the unfolding nature of the Candy Box games and A Dark Room.",
        "Any timewalls in this game can be completely bypassed with good strategy.",
        "This game has keybinds. They are more useful than you might think. Check the options menu.",
        "Shark Game: New Frontiers is a mod of Cirrial's Untitled Shark Game. It started as a refurbishment, but quickly evolved into a total remake.",
    ],
};
