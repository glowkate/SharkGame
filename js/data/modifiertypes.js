"use strict";
SharkGame.ModifierReference = new Map();

// AN OVERVIEW OF THE MODIFIER SYSTEM

// The modifier system is effectively an overblown upgrade system with infinite flexibility. It's hard to talk about the modifier system though; it's easier to use an example.
// When purchasing most upgrades, incomeMultiplier for the upgraded generator is changed in response. The value it takes is the multiplier, in this case.
// The apply function of incomeBoost handles multiplying all the necessary incomes on its own; the effects of modifiers are handled independently.
// When purchasing some upgrades, we want to increase efficiency rather than speed.
// incomeBoost makes sure to only change incomes with positive values that are not tar,
// and yet incomeBoost for the upgraded generator is still set to the multiplier it provides.
// Just one value of incomeBoost keeps track of the entire set of possible effects.
// This is because incomeBoost handles its own behavior independent of the rest of the system, and the number it takes is merely its 'degree'.
// The degrees of these modifiers are written to SharkGame.ModifierMap.
//
// Most modifiers behave this way. Their code is handled independently, specifically so that there are few restrictions on what they can achieve.

SharkGame.ModifierTypes = {
    upgrade: {
        multiplier: {
            /** @type {Modifier} */
            incomeMultiplier: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resourceId, income) => {
                        incomes[resourceId] = income * degree;
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " speed x " + degree;
                },
                getEffect(genDegree, _outDegree, _gen, _out) {
                    return genDegree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, _out) {
                    return input * genDegree;
                },
            },
            resourceBoost: {
                defaultValue: 1,
                apply(current, degree, boostedResource) {
                    SharkGame.ResourceMap.forEach((generatingResource) => {
                        $.each(generatingResource.income, (generatedResource, amount) => {
                            if (generatedResource === boostedResource && amount > 0) {
                                generatingResource.income[generatedResource] = amount * degree;
                            }
                        });
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return "All " + sharktext.getResourceName(resource) + " production x " + degree;
                },
                getEffect(_genDegree, outDegree, _gen, _out) {
                    return outDegree;
                },
                applyToInput(input, _genDegree, outDegree, _gen, _out) {
                    return input * outDegree;
                },
            },
            incomeBoost: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resouceId, income) => {
                        if (income > 0 && resouceId !== "tar") {
                            incomes[resouceId] = income * degree;
                        }
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " efficiency x " + degree;
                },
                getEffect(genDegree, _outDegree, gen, out) {
                    return SharkGame.ResourceMap.get(gen).income[out] > 0 && out !== "tar" ? genDegree : 1;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (input > 0 && out !== "tar" ? genDegree : 1);
                },
            },
            sandMultiplier: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    if (incomes.sand) {
                        incomes.sand = incomes.sand * degree;
                    }
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " collection of " + sharktext.getResourceName("sand") + " x " + degree;
                },
                getEffect(degree, _gen, _out) {
                    return degree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (out !== "sand" ? genDegree : 1);
                },
            },
            kelpMultiplier: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    if (incomes.kelp) {
                        incomes.kelp = incomes.kelp * degree;
                    }
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " collection of " + sharktext.getResourceName("kelp") + " x " + degree;
                },
                getEffect(degree, _gen, _out) {
                    return degree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (out !== "kelp" ? genDegree : 1);
                },
            },
            heaterMultiplier: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    if (incomes.ice && incomes.ice < 0) {
                        incomes.ice = incomes.ice * degree;
                    }
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " melts " + sharktext.getResourceName("ice") + " " + degree + "x faster.";
                },
                getEffect(degree, _gen, _out) {
                    return degree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (out === "ice" && input < 0 ? genDegree : 1);
                },
            },
        },
        other: {
            addCoralIncome: {
                defaultValue: 0,
                apply(current, degree, resource) {
                    const baseIncomes = SharkGame.ResourceMap.get(resource).baseIncome;
                    baseIncomes.coral = (baseIncomes.coral ? baseIncomes.coral : 0) + degree;
                    res.reapplyModifiers(resource, "coral");
                    return current + degree;
                },
                effectDescription(_degree, _resource) {
                    return "";
                },
                getEffect(_genDegree, _outDegree, _gen, _out) {
                    return 1;
                },
                applyToInput(input, _genDegree, _outDegree, _gen, _out) {
                    // this applies to base income so it should never be reapplied
                    return input;
                },
            },
            addJellyIncome: {
                defaultValue: 0,
                apply(current, degree, resource) {
                    const baseIncomes = SharkGame.ResourceMap.get(resource).baseIncome;
                    baseIncomes.jellyfish = (baseIncomes.jellyfish ? baseIncomes.jellyfish : 0) + degree;
                    res.reapplyModifiers(resource, "jellyfish");
                    return current + degree;
                },
                effectDescription(_degree, _resource) {
                    return "";
                },
                getEffect(_genDegree, _outDegree, _gen, _out) {
                    return 1;
                },
                applyToInput(input, _genDegree, _outDegree, _gen, _out) {
                    // this applies to base income so it should never be reapplied
                    return input;
                },
            },
        },
    },

    world: {
        multiplier: {
            planetaryIncomeMultiplier: {
                defaultValue: 1,
                name: "Planetary Income Multiplier",
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resouceId, income) => {
                        incomes[resouceId] = income * (1 + degree);
                    });
                    return current * (1 + degree);
                },
                effectDescription(degree, resource) {
                    return "Income from " + sharktext.getResourceName(resource, false, 2) + " x" + (1 + degree).toFixed(2);
                },
                getEffect(genDegree, _outDegree, _gen, _out) {
                    return genDegree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, _out) {
                    return input * genDegree;
                },
            },
            planetaryIncomeReciprocalMultiplier: {
                defaultValue: 1,
                name: "Planetary Income Reciprocal Multiplier",
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resourceId, income) => {
                        incomes[resourceId] = income * (1 / (1 + degree));
                    });
                    return current * (1 / (1 + degree));
                },
                effectDescription(degree, resource) {
                    return "Income from " + sharktext.getResourceName(resource, false, 2) + " x" + (1 / (1 + degree)).toFixed(2);
                },
                getEffect(genDegree, _outDegree, _gen, _out) {
                    return genDegree;
                },
                applyToInput(input, genDegree, _outDegree, _gen, _out) {
                    return input * genDegree;
                },
            },
            planetaryResourceBoost: {
                defaultValue: 1,
                name: "Planetary Boost",
                apply(current, degree, boostedResource) {
                    SharkGame.ResourceMap.forEach((generatingResource) => {
                        $.each(generatingResource.income, (generatedResource, amount) => {
                            if (generatedResource === boostedResource && amount > 0) {
                                generatingResource.income[generatedResource] = amount * (1 + degree);
                            }
                        });
                    });
                    return current * (1 + degree);
                },
                effectDescription(degree, resource) {
                    return "All " + sharktext.getResourceName(resource, false, 2) + " x" + (1 + degree).toFixed(2);
                },
                getEffect(_genDegree, outDegree, _gen, _out) {
                    return outDegree;
                },
                applyToInput(input, _genDegree, outDegree, _gen, _out) {
                    return input * outDegree;
                },
            },
            planetaryResourceReciprocalBoost: {
                defaultValue: 1,
                name: "Planetary Reciprocal Boost",
                apply(current, degree, boostedResource) {
                    SharkGame.ResourceMap.forEach((generatingResource) => {
                        $.each(generatingResource.income, (generatedResource, amount) => {
                            if (generatedResource === boostedResource && amount > 0) {
                                generatingResource.income[generatedResource] = amount * (1 / (1 + degree));
                            }
                        });
                    });
                    return current * (1 / (1 + degree));
                },
                effectDescription(degree, resource) {
                    return "All " + sharktext.getResourceName(resource, false, 2) + " x" + (1 / (1 + degree)).toFixed(2);
                },
                getEffect(_genDegree, outDegree, _gen, _out) {
                    return outDegree;
                },
                applyToInput(input, _genDegree, outDegree, _gen, _out) {
                    return input * outDegree;
                },
            },
        },
        other: {
            planetaryIncome: {
                defaultValue: 0,
                name: "Income per Climate Level",
                apply(current, degree, resource) {
                    if (!SharkGame.ResourceMap.get("world").baseIncome) {
                        SharkGame.ResourceMap.get("world").baseIncome = {};
                        SharkGame.ResourceMap.get("world").income = {};
                    }
                    const baseIncomes = SharkGame.ResourceMap.get("world").baseIncome;
                    baseIncomes[resource] = (baseIncomes[resource] ? baseIncomes[resource] : 0) + degree;
                    res.reapplyModifiers("world", resource);
                    return current + degree;
                },
                effectDescription(degree, resource) {
                    return "Gain " + sharktext.beautify(degree) + " " + sharktext.getResourceName(resource, false, degree) + " per second";
                },
                applyToInput(input, _genDegree, _outDegree, _gen, _out) {
                    // planetary income handled separately
                    return input;
                },
            },
            planetaryStartingResources: {
                defaultValue: 0,
                name: "Planetary Starting Resources",
                apply(current, degree, resource) {
                    res.changeResource(resource * degree);
                    return current + degree;
                },
                effectDescription(degree, resource) {
                    return "Start with " + degree + " " + sharktext.getResourceName(resource, false, degree);
                },
                applyToInput(input, _genDegree, _outDegree, _gen, _out) {
                    // starting resources has no bearing on income
                    return input;
                },
            },
            planetaryGeneratorRestriction: {
                defaultValue: [],
                name: "Restricted Generator-Income Combination",
                apply(current, restriction, generator) {
                    SharkGame.ResourceMap.get(generator).income[restriction] = 0;
                    if (typeof current !== "object") {
                        return [restriction];
                    }
                    current.push(restriction);
                    return current;
                },
                effectDescription(restriction, generator) {
                    return sharktext.getResourceName(generator, false, 2) + " cannot produce " + sharktext.getResourceName(restriction, false, 2);
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return genDegree.includes(out) ? 0 : input;
                },
            },
        },
    },

    aspect: {
        multiplier: {
            pathOfIndustry: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resouceId, income) => {
                        if (income > 0 && resouceId !== "tar") {
                            incomes[resouceId] = income * degree;
                        }
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " efficiency x " + degree;
                },
                getEffect(genDegree, _outDegree, gen, out) {
                    return SharkGame.ResourceMap.get(gen).income[out] > 0 && out !== "tar" ? genDegree : 1;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (input > 0 && out !== "tar" ? genDegree : 1);
                },
            },
            constructedConception: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resouceId, income) => {
                        if (income > 0 && resouceId !== "tar") {
                            incomes[resouceId] = income * degree;
                        }
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " efficiency x " + degree;
                },
                getEffect(genDegree, _outDegree, gen, out) {
                    return SharkGame.ResourceMap.get(gen).income[out] > 0 && out !== "tar" ? genDegree : 1;
                },
                applyToInput(input, genDegree, _outDegree, _gen, out) {
                    return input * (input > 0 && out !== "tar" ? genDegree : 1);
                },
            },
            theTokenForGenerators: {
                defaultValue: 1,
                apply(current, degree, resource) {
                    const incomes = SharkGame.ResourceMap.get(resource).income;
                    $.each(incomes, (resourceId, income) => {
                        incomes[resourceId] = income * degree;
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return sharktext.getResourceName(resource) + " speed x " + degree;
                },
                getEffect(genDegree, _outDegree, gen, out) {
                    return SharkGame.ResourceMap.get(gen).income[out] > 0 && out !== "tar" ? genDegree : 1;
                },
                applyToInput(input, genDegree, _outDegree, _gen, _out) {
                    return input * genDegree;
                },
            },
            theTokenForResources: {
                defaultValue: 1,
                apply(current, degree, boostedResource) {
                    SharkGame.ResourceMap.forEach((generatingResource) => {
                        $.each(generatingResource.income, (generatedResource, amount) => {
                            if (generatedResource === boostedResource && amount > 0) {
                                generatingResource.income[generatedResource] = amount * degree;
                            }
                        });
                    });
                    return current * degree;
                },
                effectDescription(degree, resource) {
                    return "All " + sharktext.getResourceName(resource) + " production x " + degree;
                },
                getEffect(_genDegree, outDegree, gen, out) {
                    return SharkGame.ResourceMap.get(gen).income[out] > 0 && out !== "tar" ? outDegree : 1;
                },
                applyToInput(input, _genDegree, outDegree, _gen, _out) {
                    return input * outDegree;
                },
            },
        },
        other: {
            clawSharpening: {
                defaultValue: 0,
                apply(_current, degree, resource) {
                    const baseIncomes = SharkGame.ResourceMap.get(resource).baseIncome;
                    baseIncomes.fish = 0.1 * 2 ** (degree - 1);
                    res.reapplyModifiers(resource, "fish");
                    return degree;
                },
                getEffect(_genDegree, _outDegree, _gen, _out) {
                    return 1;
                },
                applyToInput(input, _genDegree, _outDegree, _gen, _out) {
                    return input;
                },
            },
        },
    },
};
