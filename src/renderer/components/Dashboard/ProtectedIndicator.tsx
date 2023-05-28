import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import SquareContainer from '@renderer/components/global/SquareContainer';

export default function ProtecedIndicator() {
    return (
        <SquareContainer
            tooltip="This farm is protected and comes with Drop Farmer. This means, this farm can't be deleted."
            tooltipPlacement="bottom"
            className="text-snow-300 aspect-square p-1 rounded bg-pepper-800"
        >
            <Icon sprite={faShieldHalved} size="1x" />
        </SquareContainer>
    );
}
