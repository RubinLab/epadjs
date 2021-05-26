#!/bin/bash
# generate a object in the format npm build does with the environment variables
get_react_environment_vars() {
    ALL_ENV=$(env | sed -e 's/=.*//g')
    NEW_OBJ='Object({NODE_ENV:"production"';
    for var in $ALL_ENV
    do
        # we just want environment variables related to react
        if [[ $var == 'NODE_ENV' || $var == 'PUBLIC_URL' || $var == REACT_APP* ]]
        then
            if [[ NEW_OBJ != 'Object({NODE_ENV:"production"' ]]
            then 
                NEW_OBJ+=','
            fi
            NEW_OBJ+="$var:\"`printenv $var`\""
        fi
    done
    # NEW_OBJ+='})';

}

get_react_environment_vars
# escape / cause it messes up replace
NEW_OBJ=${NEW_OBJ//"/"/"\/"}

MAIN_JS=$(find /usr/share/nginx/html/static/js/main.*js)

# check if there is an original file and start from that as replace assumes to find the original form of environment variables
ORG_MAIN_JS=$(find /usr/share/nginx/html/static/js/main.*js.original)
if [[ ! -z $ORG_MAIN_JS ]]
then 
    echo "Getting the original js file"
    cp "$MAIN_JS".original "$MAIN_JS"
fi
# make a copy of the mainjs so we can always go back to original
cp "$MAIN_JS" "$MAIN_JS".original

OLD_OBJ="Object({NODE_ENV:\"production\",PUBLIC_URL:\"\""
sed -i -e "s/$OLD_OBJ/$NEW_OBJ/g" "$MAIN_JS"
echo "Replaced main.js file environment $OLD_OBJ with $NEW_OBJ"

MAIN_JS=$(find /usr/share/nginx/html/static/js/2.*js)
# check if there is an original file and start from that as replace assumes to find the original form of environment variables
ORG_MAIN_JS=$(find /usr/share/nginx/html/static/js/2.*js.original)
if [[ ! -z $ORG_MAIN_JS ]]
then 
    echo "Getting the original js file"
    cp "$MAIN_JS".original "$MAIN_JS"
fi
# make a copy of the mainjs so we can always go back to original
cp "$MAIN_JS" "$MAIN_JS".original

OLD_OBJ="Object({NODE_ENV:\"production\",PUBLIC_URL:\"\""
sed -i -e "s/$OLD_OBJ/$NEW_OBJ/g" "$MAIN_JS"
echo "Replaced 2.js file environment $OLD_OBJ with $NEW_OBJ"

exec "$@"

