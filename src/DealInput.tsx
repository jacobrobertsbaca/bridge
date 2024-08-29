import {
  IconButton,
  MenuItem,
  Stack,
  SvgIcon,
  SxProps,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Formik, FormikProps, useFormikContext } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Contract, Deal, Honors, otherSide, Side, Trump } from "./types";
import FormikTextField from "./FormikTextField";
import PlusIcon from "@heroicons/react/24/solid/PlusCircleIcon";
import StopIcon from "@heroicons/react/24/solid/StopCircleIcon";

const formSchema = z.object({
  declarer: z.nativeEnum(Side),
  contract: z.string().refine((v) => !!Contract.parse(v), { message: "Invalid contract" }),
  tricks: z.number(),
  honors: z.record(z.nativeEnum(Side), z.nativeEnum(Honors)),
  isLast: z.boolean(),
});

type Form = z.infer<typeof formSchema>;

const buttonSchema: SxProps = {
  width: 28,
  height: 28,
};

function getDeal(values: FormikProps<Form>["values"]): Deal | undefined {
  const contract = Contract.parse(values.contract);
  if (!contract) return undefined;
  const deal = new Deal(values.declarer, contract, values.tricks, values.honors);
  deal.setLast(values.isLast);
  return deal;
}

function Caption({ children, ...rest }: TypographyProps) {
  return (
    <Typography variant="caption" color="text.secondary" {...rest}>
      {children}
    </Typography>
  );
}

function TrickSelector({ from, to, disabled }: { from: number; to: number; disabled?: boolean }) {
  const formik = useFormikContext<Form>();
  return (
    <ToggleButtonGroup
      exclusive
      value={formik.values.tricks}
      onChange={(_, v) => v !== undefined && formik.setFieldValue("tricks", v)}
      disabled={disabled}
    >
      {Array.from({ length: to - from + 1 }, (_, index) => index + from).map((v) => (
        <ToggleButton value={v} key={v} sx={buttonSchema}>
          <Typography variant="caption">{v}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function HonorsSelector({ side, disabled }: { side: Side; disabled?: boolean }) {
  const formik = useFormikContext<Form>();
  return (
    <Stack>
      <ToggleButtonGroup
        exclusive
        value={formik.values.honors[side]}
        orientation="vertical"
        onChange={(_, v) => {
          formik.setFieldValue(`honors.${side}`, v ?? undefined);
          if (v) formik.setFieldValue(`honors.${otherSide(side)}`, undefined);
        }}
        disabled={disabled}
      >
        <Tooltip title={"Hold 4/5 of A/K/Q/J/10 of trumps."} placement="top" arrow>
          <ToggleButton
            value={Honors.Partial}
            sx={buttonSchema}
            disabled={Contract.parse(formik.values.contract)?.trump === Trump.NoTrump}
          >
            <Typography variant="caption">H</Typography>
          </ToggleButton>
        </Tooltip>
        <Tooltip title={"Hold all A/K/Q/J/10 of trumps, or all four aces if NT."} placement="bottom" arrow>
          <ToggleButton value={Honors.Full} sx={buttonSchema}>
            <Typography variant="caption">FH</Typography>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Caption textAlign="center">{side}</Caption>
    </Stack>
  );
}

function DealInputForm({ disabled }: DealInputProps) {
  const formik = useFormikContext<Form>();
  const theme = useTheme();
  const xs = !useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Stack direction={{ xs: "column", sm: "row" }} alignItems="start" spacing={1}>
      <Stack direction="row" alignItems="start" spacing={1} sx={xs ? { width: 1 } : {}}>
        <FormikTextField
          select
          name="declarer"
          label="Declarer"
          helperText={undefined}
          fullWidth={xs}
          sx={{ width: xs ? undefined : 80 }}
          disabled={disabled}
        >
          {Object.values(Side).map((side) => (
            <MenuItem key={side} value={side}>
              {side}
            </MenuItem>
          ))}
        </FormikTextField>

        <FormikTextField
          label="Contract"
          name="contract"
          fullWidth={xs}
          sx={{ width: xs ? undefined : 120 }}
          helperText={Contract.parse(formik.values.contract)?.toSymbol()}
          onChange={(evt) => {
            if (Contract.MASK.test(evt.target.value)) formik.setFieldValue("contract", evt.target.value);
          }}
          disabled={disabled}
          placeholder="1sxx"
          autoComplete="off"
        />
      </Stack>

      <Stack direction="row" alignItems="start" spacing={1}>
        <Stack>
          <TrickSelector from={0} to={6} disabled={disabled} />
          <TrickSelector from={7} to={13} disabled={disabled} />
          <Caption>Tricks Won</Caption>
        </Stack>

        <HonorsSelector side={Side.NorthSouth} disabled={disabled} />
        <HonorsSelector side={Side.EastWest} disabled={disabled} />
      </Stack>

      <Stack direction="row" spacing={-1}>
        <Tooltip title="Enter a deal" arrow placement="top">
          <IconButton
            aria-label="add"
            disabled={disabled || !formik.isValid}
            onClick={formik.submitForm}
            color="primary"
          >
            <SvgIcon>
              <PlusIcon />
            </SvgIcon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Enter the final deal" arrow placement="top">
          <IconButton
            aria-label="stop"
            disabled={disabled || !formik.isValid}
            onClick={() => {
              formik.setFieldValue("isLast", true);
              formik.submitForm();
            }}
          >
            <SvgIcon>
              <StopIcon />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export type DealInputProps = {
  disabled?: boolean;
  onDeal: (deal: Deal) => void;
};

export default function DealInput(props: DealInputProps) {
  return (
    <Formik<Form>
      initialValues={{
        declarer: Side.NorthSouth,
        contract: "",
        tricks: undefined as any,
        honors: {},
        isLast: false,
      }}
      validationSchema={toFormikValidationSchema(formSchema)}
      onSubmit={(values, { setFieldValue }) => {
        props.onDeal(getDeal(values)!);
        setFieldValue("isLast", false);
      }}
    >
      <DealInputForm {...props} />
    </Formik>
  );
}
