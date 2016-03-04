import QUnit from "steal-qunit";
import F from "funcunit";

F.attach(QUnit);
QUnit.config.reorder = false;

import "bit/bit_test";
import "bits_vertical_infinite/bits_vertical_infinite_test";