#!/bin/bash

front_tests() {
	cd "frontend" || return 127
	echo "[LOG] Executing frontend tests"
	npm test
	FRONT_TESTS_RESULT=$?
	echo "[LOG] Frontend tests exit code: ${FRONT_TESTS_RESULT}"
	cd ..
	return $FRONT_TESTS_RESULT
}

back_tests() {
	cd "backend" || return 127
	echo "[LOG] Executing backend tests"
	npm test
	BACK_TESTS_RESULT=$?
	echo "[LOG] Backend tests exit code: ${BACK_TESTS_RESULT}"
	cd ..
	return $BACK_TESTS_RESULT
}

#front_tests
back_tests

if [ $FRONT_TESTS_RESULT -ne 0 ] || [ $BACK_TESTS_RESULT -ne 0 ]; then
	exit 127
fi

exit 0
