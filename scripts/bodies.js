'use strict';
// The body types a mask is built for, and the female variant FemaleBodyVariants
// may draw instead. Shared by the mask builder and the GIMP layout.
module.exports = [
    { name: 'Female', source: 'Naked_Female', variant: null },
    { name: 'Male', source: 'Naked_Male', variant: null },
    { name: 'Thin', source: 'Naked_Thin', variant: 'Naked_Thin_Female' },
    { name: 'Fat', source: 'Naked_Fat', variant: 'Naked_Fat_Female' },
    { name: 'Hulk', source: 'Naked_Hulk', variant: 'Naked_Hulk_Female' },
    { name: 'Child', source: 'Naked_Child', variant: null },
];
