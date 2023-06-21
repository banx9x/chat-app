import { SearchIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { ChangeEvent } from "react";

interface SearchContactBoxProps {
    onFocus: () => void;
    onBlur: () => void;
    onChange: (query: string) => void;
}

export default function SearchContactBox({
    onFocus,
    onBlur,
    onChange,
}: SearchContactBoxProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <InputGroup>
            <InputLeftElement pointerEvents={"none"}>
                <SearchIcon color={"gray.400"} />
            </InputLeftElement>
            <Input
                type="text"
                focusBorderColor="green.400"
                placeholder="Search contact"
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={handleChange}
            />
        </InputGroup>
    );
}
