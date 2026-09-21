# The trousers on every silhouette, and which texture each one is drawn from.
#
# 01 dresses colonists as they are generated, and found that "gender is male" leaves the body
# type alone: the pawn it captioned as a man was a woman's body. What a body type is, is a
# separate fact from a gender, and vanilla generation rarely produces a woman whose body type is
# Fat, Thin or Hulk, or a boy. This file sets both, then dresses the pawn.
#
# It needs a Pickle that has two steps the released one lacks, RimWorks/Rimworld-Pickle#32:
# `{string} body type is {word}` and `{string} apparel {string} is drawn from {string}`. Stage a
# build of that branch with `Run-PickleWsl.ps1 -PickleSrc <folder>`; against the Workshop Pickle
# this file fails on undefined steps, which is why it is a file of its own and 01 is not.
#
# Two things per pawn, and they do different jobs. The capture is for a person: whether the
# waistband sits right on that body is a judgement about an image. The path is an assertion:
# the game draws a garment from its texture path plus the body type, and reading what it actually
# draws catches a body type that got no trousers, or the wrong ones, without looking at anything.
# The path is the same whoever supplies the texture, AB or this mod, so it says nothing about the
# art, only about which file the game asked for.
#
# The order matters. The step sets a body type directly and the game can choose again: a gene
# that carries a body type re-applies it, and a child growing up recomputes it. So the age and
# the gender are set first, the body type after them, and the gear last.
#
# No @requires:wdi here beyond the tags below: without a legless body retexture these are
# captures of nothing worth judging. The bare pass skips them.
@review @watch @timeout:120
Feature: the trousers on every silhouette

  Background:
    Given the save "test-colony" is loaded

  @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a man, body type Male
    Given a colonist "S-Man" exists
    And "S-Man" gender is male
    And "S-Man" body type is Male
    When I destroy the gear of "S-Man"
    And I dress "S-Man" in "Apparel_Pants"
    And "S-Man" is wearing "Apparel_Pants"
    And I draft "S-Man"
    And I select "S-Man"
    And I zoom all the way in
    And I move the camera to "S-Man"
    And I wait 120 ticks
    Then "S-Man" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Male"
    And I take a screenshot "silhouette, man, Male"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a woman, body type Female
    Given a colonist "S-Woman" exists
    And "S-Woman" gender is female
    And "S-Woman" body type is Female
    When I destroy the gear of "S-Woman"
    And I dress "S-Woman" in "Apparel_Pants"
    And "S-Woman" is wearing "Apparel_Pants"
    And I draft "S-Woman"
    And I select "S-Woman"
    And I zoom all the way in
    And I move the camera to "S-Woman"
    And I wait 120 ticks
    Then "S-Woman" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Female"
    And I take a screenshot "silhouette, woman, Female"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a thin man
    Given a colonist "S-ThinMan" exists
    And "S-ThinMan" gender is male
    And "S-ThinMan" body type is Thin
    When I destroy the gear of "S-ThinMan"
    And I dress "S-ThinMan" in "Apparel_Pants"
    And "S-ThinMan" is wearing "Apparel_Pants"
    And I draft "S-ThinMan"
    And I select "S-ThinMan"
    And I zoom all the way in
    And I move the camera to "S-ThinMan"
    And I wait 120 ticks
    Then "S-ThinMan" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Thin"
    And I take a screenshot "silhouette, man, Thin"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a thin woman
    Given a colonist "S-ThinWoman" exists
    And "S-ThinWoman" gender is female
    And "S-ThinWoman" body type is Thin
    When I destroy the gear of "S-ThinWoman"
    And I dress "S-ThinWoman" in "Apparel_Pants"
    And "S-ThinWoman" is wearing "Apparel_Pants"
    And I draft "S-ThinWoman"
    And I select "S-ThinWoman"
    And I zoom all the way in
    And I move the camera to "S-ThinWoman"
    And I wait 120 ticks
    Then "S-ThinWoman" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Thin"
    And I take a screenshot "silhouette, woman, Thin"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a fat man
    Given a colonist "S-FatMan" exists
    And "S-FatMan" gender is male
    And "S-FatMan" body type is Fat
    When I destroy the gear of "S-FatMan"
    And I dress "S-FatMan" in "Apparel_Pants"
    And "S-FatMan" is wearing "Apparel_Pants"
    And I draft "S-FatMan"
    And I select "S-FatMan"
    And I zoom all the way in
    And I move the camera to "S-FatMan"
    And I wait 120 ticks
    Then "S-FatMan" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Fat"
    And I take a screenshot "silhouette, man, Fat"

  # The one that sends a woman to General's Pants_Fat_Female, when Female Apparel Variants is
  # active. Without it the game draws Pants_Fat and so does this. With it, and with the variants
  # pass, the expected path below becomes Pants_Fat_Female: change it with the pass, not before.
  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a fat woman
    Given a colonist "S-FatWoman" exists
    And "S-FatWoman" gender is female
    And "S-FatWoman" body type is Fat
    When I destroy the gear of "S-FatWoman"
    And I dress "S-FatWoman" in "Apparel_Pants"
    And "S-FatWoman" is wearing "Apparel_Pants"
    And I draft "S-FatWoman"
    And I select "S-FatWoman"
    And I zoom all the way in
    And I move the camera to "S-FatWoman"
    And I wait 120 ticks
    Then "S-FatWoman" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Fat"
    And I take a screenshot "silhouette, woman, Fat"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a hulking man
    Given a colonist "S-HulkMan" exists
    And "S-HulkMan" gender is male
    And "S-HulkMan" body type is Hulk
    When I destroy the gear of "S-HulkMan"
    And I dress "S-HulkMan" in "Apparel_Pants"
    And "S-HulkMan" is wearing "Apparel_Pants"
    And I draft "S-HulkMan"
    And I select "S-HulkMan"
    And I zoom all the way in
    And I move the camera to "S-HulkMan"
    And I wait 120 ticks
    Then "S-HulkMan" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Hulk"
    And I take a screenshot "silhouette, man, Hulk"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a hulking woman
    Given a colonist "S-HulkWoman" exists
    And "S-HulkWoman" gender is female
    And "S-HulkWoman" body type is Hulk
    When I destroy the gear of "S-HulkWoman"
    And I dress "S-HulkWoman" in "Apparel_Pants"
    And "S-HulkWoman" is wearing "Apparel_Pants"
    And I draft "S-HulkWoman"
    And I select "S-HulkWoman"
    And I zoom all the way in
    And I move the camera to "S-HulkWoman"
    And I wait 120 ticks
    Then "S-HulkWoman" apparel "Apparel_Pants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Hulk"
    And I take a screenshot "silhouette, woman, Hulk"

  # A child has to be aged first: the body type is set after, and a child growing up would
  # recompute it. Apparel_KidPants is the Biotech child's own garment, a different def.
  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a boy
    Given a colonist "S-Boy" exists
    And "S-Boy" gender is male
    And "S-Boy" is 8 years old
    And "S-Boy" body type is Child
    When I destroy the gear of "S-Boy"
    And I dress "S-Boy" in "Apparel_KidPants"
    And "S-Boy" is wearing "Apparel_KidPants"
    And I draft "S-Boy"
    And I select "S-Boy"
    And I zoom all the way in
    And I move the camera to "S-Boy"
    And I wait 120 ticks
    Then "S-Boy" apparel "Apparel_KidPants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Child"
    And I take a screenshot "silhouette, boy, Child"

  @same-world @requires:ab.vplrf @requires:wdi.realistic.bodies
  Scenario: a girl
    Given a colonist "S-Girl" exists
    And "S-Girl" gender is female
    And "S-Girl" is 8 years old
    And "S-Girl" body type is Child
    When I destroy the gear of "S-Girl"
    And I dress "S-Girl" in "Apparel_KidPants"
    And "S-Girl" is wearing "Apparel_KidPants"
    And I draft "S-Girl"
    And I select "S-Girl"
    And I zoom all the way in
    And I move the camera to "S-Girl"
    And I wait 120 ticks
    Then "S-Girl" apparel "Apparel_KidPants" is drawn from "Things/Pawn/Humanlike/Apparel/Pants/Pants_Child"
    And I take a screenshot "silhouette, girl, Child"
