
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

declare class TableXLClass {
    DeepCopy(element: unknown): unknown
    DeepMatching(element1: unknown, element2: unknown): boolean
}

declare let TableXL: TableXLClass

export = TableXL
