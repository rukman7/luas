#!/bin/bash
# Basic while loop

# local config
# rootDir=$HOME/research/policyRequest
# rep=1

# server path
rootDir=$HOME/policyRequest
rep=10

dmRunId=1
stacsRunId=0
policyVersion=0.1
fmt=xml
numReps=2
outDbPath=$HOME/request/results.db
problemRef=dmGenerated
policyRef=FirstApplicable-DistributedDeny
policyName=pol_G3.xml
contextRef=test

policyDirRoot=$rootDir/policy/$problemRef
requestDirRoot=$rootDir/request/$problemRef

declare -a policySizeArray=("small" "medium");
declare -a policyTypeArray=("COARSE" "FINE");
declare -a requestTypesArray=("ALL" "DBL" "NA" "SGL");
declare -a requestContextSubRefArray=("ff" "ft" "tf" "tt");

# declare -a policySizeArray=("large");
# declare -a policyTypeArray=("FINE");
# declare -a requestTypesArray=("ALL");
# declare -a requestContextSubRefArray=("ff");

for ((c=0;c<$rep;c++))
do
	for i in "${policySizeArray[@]}"
	do
		for j in "${policyTypeArray[@]}"
		do
			for k in "${requestTypesArray[@]}"
			do
				for f in "${requestContextSubRefArray[@]}"
				do node pdpTest.js $policyDirRoot/$i/$policyRef/$policyVersion/$j/$dmRunId/$fmt/$policyName $requestDirRoot/$i/$policyRef/$policyVersion/$k/$contextRef/$f/$dmRunId/$fmt $c
				done
			done
		done
	done
done



echo All done
