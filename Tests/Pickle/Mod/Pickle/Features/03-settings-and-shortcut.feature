# Scenarios 9 and 10 of TESTING.md, the parts a running game settles.
#
# What is NOT here, because Tests/Check-Settings.ps1 and Tests/Check-Localization.ps1 already
# prove it outside the game: the defaults, the reset, the clamping of a hand-edited config, and
# that both Keyed folders hold the same keys. Repeating any of that in Gherkin would confiscate
# the machine for tens of minutes to learn what a few seconds already established.
#
# What only the game can say: whether the button bar draws the shortcut, whether its worker opens
# OUR settings page, and whether the keys resolve in the language actually loaded - a folder the
# game failed to find looks exactly like a folder that is there, from the outside.
#
# The screenshot scenario is tagged @review, which is documentation and not a Pickle tag: the
# image comes from the explicit step, and green says the route ran, never that the page reads
# well. Read it in developer mode - AUDIT.md explains why: outside developer mode a key missing
# from the active language falls back to clean English, which is indistinguishable from a correct
# English run, so such a capture is no evidence at all.
Feature: the settings page, and the shortcut that is hidden by default

  Scenario: on a clean configuration the shortcut is neither drawn nor greyed out
    Given the save "test-colony" is loaded
    Then the TailorMade Waistlines shortcut is neither drawn nor greyed out

  Scenario: the shortcut opens this mod's own settings page
    Given the save "test-colony" is loaded
    When I close all dialogs
    And I open the TailorMade Waistlines settings through the shortcut and let it draw
    Then window "Dialog_ModSettings" is open
    And the settings window open is TailorMade Waistlines' own
    And every settings key resolves in the language the game runs in

  @review
  Scenario: the page as it is drawn, in whatever language the game runs
    Given the save "test-colony" is loaded
    When I close all dialogs
    And I open the TailorMade Waistlines settings through the shortcut and let it draw
    And I hide the interface around the windows on screen
    Then I take a screenshot "the settings page, as drawn"
    When I bring the interface back
