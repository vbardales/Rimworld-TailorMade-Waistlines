# Scenario 8 of TESTING.md, the half of it a single process can answer.
#
# Tests/Check-Settings.ps1 proves the settings object round-trips and clamps what it reads back.
# What it cannot do is write the file the game writes, in the folder the game writes it to, and
# read it back through the game's own Scribe: that path runs through LoadedModManager and the
# mod's WriteSettings override, and it is where a value goes missing for real.
#
# What stays manual: a true restart, and a save loaded after one. This reads the file back in the
# running process, which is not the same as a def database rebuilt from XML.
Feature: a band survives being written and read back

  Scenario: the value reaches the file and comes back from it
    Given the save "test-colony" is loaded
    When I close all dialogs
    And I move the pants band to 0.42 and close the settings window
    Then the settings file on disk holds 0.42 for the pants band
    When the mod reads its settings file again
    Then the pants band is 0.42
    And TailorMade answers 0.42 for the pants band
    And the mod logged no error since startup
