import {
  IconButton,
  MenuItem,
  Stack,
  SvgIcon,
  SxProps,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TypographyProps,
} from "@mui/material";
import { Formik, FormikProps, FormikValues, useFormikContext } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Contract, Deal, Honors, Side } from "./types";
import FormikTextField from "./FormikTextField";
import PlusIcon from "@heroicons/react/24/solid/PlusCircleIcon";

const formSchema = z.object({
  declarer: z.nativeEnum(Side),
  contract: z.string().refine((v) => !!Contract.parse(v), { message: "Invalid contract" }),
  tricks: z.number(),
  honors: z.record(z.nativeEnum(Side), z.nativeEnum(Honors)),
});

type Form = z.infer<typeof formSchema>;

const buttonSchema: SxProps = {
  width: 28,
  height: 28,
};

function getDeal(values: FormikProps<Form>["values"]): Deal | undefined {
  const contract = Contract.parse(values.contract);
  if (!contract) return undefined;
  return new Deal(values.declarer, contract, values.tricks, values.honors);
}

function Caption({ children, ...rest }: TypographyProps) {
  return (
    <Typography variant="caption" color="text.secondary" {...rest}>
      {children}
    </Typography>
  );
}

function TrickSelector({ from, to }: { from: number; to: number }) {
  const formik = useFormikContext<Form>();
  return (
    <ToggleButtonGroup
      exclusive
      value={formik.values.tricks}
      onChange={(_, v) => v !== undefined && formik.setFieldValue("tricks", v)}
    >
      {Array.from({ length: to - from + 1 }, (_, index) => index + from).map((v) => (
        <ToggleButton value={v} key={v} sx={buttonSchema}>
          <Typography variant="caption">{v}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function HonorsSelector({ side }: { side: Side }) {
  const formik = useFormikContext<Form>();
  return (
    <Stack>
      <ToggleButtonGroup
        exclusive
        value={formik.values.honors[side]}
        orientation="vertical"
        onChange={(_, v) => formik.setFieldValue(`honors.${side}`, v ?? undefined)}
      >
        <ToggleButton value={Honors.Partial} sx={buttonSchema}>
          <Typography variant="caption">H</Typography>
        </ToggleButton>
        <ToggleButton value={Honors.Full} sx={buttonSchema}>
          <Typography variant="caption">FH</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
      <Caption textAlign="center">{side}</Caption>
    </Stack>
  );
}

function DealInputForm(props: DealInputProps) {
  const formik = useFormikContext<Form>();
  console.log(formik.values);
  return (
    <Stack direction="row" alignItems="start" spacing={1}>
      <FormikTextField select name="declarer" label="Declarer" helperText={undefined} sx={{ width: 120 }}>
        {Object.values(Side).map((side) => (
          <MenuItem key={side} value={side}>
            {side}
          </MenuItem>
        ))}
      </FormikTextField>
      <FormikTextField
        label="Contract"
        name="contract"
        sx={{ width: 80 }}
        helperText={Contract.parse(formik.values.contract)?.toSymbol()}
        onChange={(evt) => {
          if (Contract.MASK.test(evt.target.value)) formik.setFieldValue("contract", evt.target.value);
        }}
      />

      <Stack>
        <TrickSelector from={0} to={6} />
        <TrickSelector from={7} to={13} />
        <Caption>Tricks Won</Caption>
      </Stack>

      <HonorsSelector side={Side.NorthSouth} />
      <HonorsSelector side={Side.EastWest} />

      <IconButton aria-label="add" disabled={!formik.isValid} onClick={formik.submitForm}>
        <SvgIcon>
          <PlusIcon />
        </SvgIcon>
      </IconButton>
    </Stack>
  );
}

export type DealInputProps = {
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
      }}
      validationSchema={toFormikValidationSchema(formSchema)}
      onSubmit={(values, { resetForm }) => {
        props.onDeal(getDeal(values)!);
        resetForm();
      }}
    >
      <DealInputForm {...props} />
    </Formik>
  );
}
