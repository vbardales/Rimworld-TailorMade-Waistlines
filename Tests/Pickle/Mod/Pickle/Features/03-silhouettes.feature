# The trousers on every silhouette: a man, a woman, a thin, a fat and a hulking one of each, a boy and a girl.
#
# 01 dresses colonists as they are generated, and found that "gender is male" leaves the body type
# alone: the pawn it captioned as a man was a woman's body. A body type is a fact of its own, and
# vanilla generation rarely gives a woman a Fat, Thin or Hulk body, or a boy at all. This file sets it.
#
# It does so with steps that run on the released Pickle. The released one sets a gender, an age and a
# backstory and no body type; the step that does, `{string} body type is {word}`, is Pickle PR #32 and
# is not released. This file used to be those ten scenarios and failed on the undefined step in every
# pass; for a while it was three, on the bodies the fixture happens to hold (git a941b2c). It is ten
# again with PickleTools' ColonistRace package, which carries a body-type step of its own that removes
# every body-type gene the pawn has and adds the one asked for, so a xenotype with several of them
# cannot pick another (the pass maps name the package: nelim.pickletools.colonistrace).
#
# A body type is set, then READ BACK by a second step, on the same line of reasoning as "is wearing":
# a step that sets a value says what was asked, not what the game holds, and the game can choose
# again (a gene that carries a body type re-applies it, a child growing up recomputes it). So the
# order is the gender first, the body type after it, the gear last, and the read-back after the wait.
#
# A boy and a girl are the exception: Child is not a body type a gene gives but the body of an age. Setting the age
# alone does not change it (2026-09-25: "it has Male"), so the age is set first and then PickleTools' "body type is
# Child" asks the game for the body of the pawn's current life stage. That step moves the clothes the stage may not
# wear into the pawn's inventory before it redraws, so the pawn is dressed AFTER it, in child garments.
#
# What is NOT asserted, because no released step reads it: the texture path the game actually draws.
# The ten in git at d9e8aa0 asserted it with PR #32's `apparel is drawn from`. What stays is the body
# type read back, the log checks that no trouser texture failed to load ("Could not load" and "Failed to find any
# textures", the second being what a missing child texture logs), and the capture for a person.
# No AB tag: any pass with a legless body retexture (WDI) and a supplier of trousers has something to
# photograph, so the XND passes run these too. The bare pass skips them.
#
# The frame. The first run (2026-09-25) passed ten of ten and showed nothing about the trousers: the selection
# bracket, the name label and the hover tooltip (the pointer rests at the centre of the screen, on the pawn) sit
# exactly over the waist of a body drawn without legs. So the pawn is not selected, and the pointer is moved onto
# the Architect button, which draws its own tooltip at the bottom of the screen. That button is found by its
# English label, so this file is for the English pass.
@review @watch @silhouettes @timeout:120
Feature: the trousers on every silhouette

  Background:
    Given the save "test-colony" is loaded
  @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a man, body type Male
    Given a colonist "S-Man" exists
    And "S-Man" gender is male
    And Nelim's Pickle Tools: "S-Man" body type is Male
    When I destroy the gear of "S-Man"
    And I dress "S-Man" in "Apparel_Pants"
    And "S-Man" is wearing "Apparel_Pants"
    And I draft "S-Man"
    And I zoom all the way in
    And I move the camera to "S-Man"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-Man" has body type Male
    And "S-Man" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, man, Male"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a woman, body type Female
    Given a colonist "S-Woman" exists
    And "S-Woman" gender is female
    And Nelim's Pickle Tools: "S-Woman" body type is Female
    When I destroy the gear of "S-Woman"
    And I dress "S-Woman" in "Apparel_Pants"
    And "S-Woman" is wearing "Apparel_Pants"
    And I draft "S-Woman"
    And I zoom all the way in
    And I move the camera to "S-Woman"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-Woman" has body type Female
    And "S-Woman" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, woman, Female"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a thin man
    Given a colonist "S-ThinMan" exists
    And "S-ThinMan" gender is male
    And Nelim's Pickle Tools: "S-ThinMan" body type is Thin
    When I destroy the gear of "S-ThinMan"
    And I dress "S-ThinMan" in "Apparel_Pants"
    And "S-ThinMan" is wearing "Apparel_Pants"
    And I draft "S-ThinMan"
    And I zoom all the way in
    And I move the camera to "S-ThinMan"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-ThinMan" has body type Thin
    And "S-ThinMan" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, man, Thin"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a thin woman
    Given a colonist "S-ThinWoman" exists
    And "S-ThinWoman" gender is female
    And Nelim's Pickle Tools: "S-ThinWoman" body type is Thin
    When I destroy the gear of "S-ThinWoman"
    And I dress "S-ThinWoman" in "Apparel_Pants"
    And "S-ThinWoman" is wearing "Apparel_Pants"
    And I draft "S-ThinWoman"
    And I zoom all the way in
    And I move the camera to "S-ThinWoman"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-ThinWoman" has body type Thin
    And "S-ThinWoman" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, woman, Thin"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a fat man
    Given a colonist "S-FatMan" exists
    And "S-FatMan" gender is male
    And Nelim's Pickle Tools: "S-FatMan" body type is Fat
    When I destroy the gear of "S-FatMan"
    And I dress "S-FatMan" in "Apparel_Pants"
    And "S-FatMan" is wearing "Apparel_Pants"
    And I draft "S-FatMan"
    And I zoom all the way in
    And I move the camera to "S-FatMan"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-FatMan" has body type Fat
    And "S-FatMan" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, man, Fat"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a fat woman
    Given a colonist "S-FatWoman" exists
    And "S-FatWoman" gender is female
    And Nelim's Pickle Tools: "S-FatWoman" body type is Fat
    When I destroy the gear of "S-FatWoman"
    And I dress "S-FatWoman" in "Apparel_Pants"
    And "S-FatWoman" is wearing "Apparel_Pants"
    And I draft "S-FatWoman"
    And I zoom all the way in
    And I move the camera to "S-FatWoman"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-FatWoman" has body type Fat
    And "S-FatWoman" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, woman, Fat"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a hulking man
    Given a colonist "S-HulkMan" exists
    And "S-HulkMan" gender is male
    And Nelim's Pickle Tools: "S-HulkMan" body type is Hulk
    When I destroy the gear of "S-HulkMan"
    And I dress "S-HulkMan" in "Apparel_Pants"
    And "S-HulkMan" is wearing "Apparel_Pants"
    And I draft "S-HulkMan"
    And I zoom all the way in
    And I move the camera to "S-HulkMan"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-HulkMan" has body type Hulk
    And "S-HulkMan" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, man, Hulk"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a hulking woman
    Given a colonist "S-HulkWoman" exists
    And "S-HulkWoman" gender is female
    And Nelim's Pickle Tools: "S-HulkWoman" body type is Hulk
    When I destroy the gear of "S-HulkWoman"
    And I dress "S-HulkWoman" in "Apparel_Pants"
    And "S-HulkWoman" is wearing "Apparel_Pants"
    And I draft "S-HulkWoman"
    And I zoom all the way in
    And I move the camera to "S-HulkWoman"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-HulkWoman" has body type Hulk
    And "S-HulkWoman" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, woman, Hulk"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a boy
    Given a colonist "S-Boy" exists
    And "S-Boy" is 8 years old
    And "S-Boy" gender is male
    And Nelim's Pickle Tools: "S-Boy" body type is Child
    When I destroy the gear of "S-Boy"
    And I dress "S-Boy" in "Apparel_KidPants"
    And "S-Boy" is wearing "Apparel_KidPants"
    And I draft "S-Boy"
    And I zoom all the way in
    And I move the camera to "S-Boy"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-Boy" has body type Child
    And Nelim's Pickle Tools: "S-Boy" is at the Child stage of life
    And "S-Boy" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, boy, Child"

  @same-world @requires:wdi.realistic.bodies @requires:nelim.pickletools.colonistrace
  Scenario: a girl
    Given a colonist "S-Girl" exists
    And "S-Girl" is 8 years old
    And "S-Girl" gender is female
    And Nelim's Pickle Tools: "S-Girl" body type is Child
    When I destroy the gear of "S-Girl"
    And I dress "S-Girl" in "Apparel_KidPants"
    And "S-Girl" is wearing "Apparel_KidPants"
    And I draft "S-Girl"
    And I zoom all the way in
    And I move the camera to "S-Girl"
    And I wait 120 ticks
    And I hover "Architect"
    Then Nelim's Pickle Tools: "S-Girl" has body type Child
    And Nelim's Pickle Tools: "S-Girl" is at the Child stage of life
    And "S-Girl" apparel covers "Legs"
    And no warning matching "Could not load UnityEngine.Texture2D" was logged
    And no warning matching "Failed to find any textures" was logged
    And I take a screenshot "silhouette, girl, Child"
