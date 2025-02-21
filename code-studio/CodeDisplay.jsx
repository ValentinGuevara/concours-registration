import React, {useState, useEffect} from 'react';
import {Text} from 'ink';

export const CodeDisplay = () => {
	const [code, setCode] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCounter(previousCounter => previousCounter + 1);
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return <Text color="green">Code à saisir: {code}</Text>;
};