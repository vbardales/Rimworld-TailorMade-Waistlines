# Throwaway exploration, not part of the suite: reads the drawSize Biotech gives Apparel_KidPants
# against Apparel_Pants, to check the "wrong scale for a body-conforming texture" hypothesis for the
# child trouser defect (STATUS.md, 2026-09-27). Deleted after being read once.
@explore @timeout:60
Feature: child pants drawSize, read back

  Background:
    Given the save "test-colony" is loaded

  Scenario: KidPants and Pants drawSize
    Then def "Apparel_KidPants" field "graphicData.drawSize" is "(0.70, 0.70)"
    And def "Apparel_Pants" field "graphicData.drawSize" is "(1.00, 1.00)"
